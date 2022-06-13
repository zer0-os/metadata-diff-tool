import Ajv from "ajv";
import {
  DatabaseNft,
  NftData,
  Maybe,
  Logger,
  UpdatedNftData,
  AjvError,
} from "./types";
import * as mongoDb from "mongodb";
import { databaseNftSchema } from "./ajvSchemas";
import { getMetadataFromIpfs } from "./ipfsAccess";

const ajv = new Ajv();
const databaseNftVerification = ajv.compile(databaseNftSchema);

const dbConnectionString = process.env.DB_CONN_STRING;
const dbName = process.env.DB_NAME;
const dbCollectionName = process.env.DB_COLLECTION_NAME;

if (!dbConnectionString) {
  throw Error("No DB_CONN_STRING in .env file");
} else if (!dbName) {
  throw Error("No DB_NAME in .env file");
} else if (!dbCollectionName) {
  throw Error("No DB_COLLECTION_NAME in .env file");
}

const getDatabaseNFT = async (
  domain: string,
  id: string,
  logger: Logger
): Promise<Maybe<DatabaseNft>> => {
  const client = new mongoDb.MongoClient(dbConnectionString);

  try {
    logger("Attempting to connect to MongoDb");
    await client.connect();

    const collection = client.db(dbName).collection(dbCollectionName);

    logger(`Searching MongoDb for NFT with domain [${domain}] and id [${id}]`);
    const nft = await collection.findOne<DatabaseNft>({
      domain: domain,
      id: id,
    });

    if (nft) {
      if (!databaseNftVerification(nft)) {
        throw new AjvError(
          "NFT from database was not valid",
          databaseNftVerification
        );
      }

      return nft;
    }

    return undefined;
  } finally {
    logger("Disconnecting from MongoDb client");
    client.close();
  }
};

const updateOneNft = async (
  collection: mongoDb.Collection,
  change: UpdatedNftData
) => {
  let nft = await collection.findOne<DatabaseNft>({
    domain: change.domain,
    id: change.id,
  });

  if (!nft) {
    nft = {
      domain: change.domain,
      id: change.id,
      versions: [
        {
          metadataUri: change.metadataUri,
          blockNumber: change.blockNumber,
        },
      ],
    };

    await collection.insertOne(nft);
  } else if (!databaseNftVerification(nft)) {
    throw new AjvError(
      `Nft does not fulfill the database Nft Schema`,
      databaseNftVerification
    );
  } else {
    nft.versions.push({
      metadataUri: change.metadataUri,
      blockNumber: change.blockNumber,
    });

    await collection.updateOne(
      { domain: nft.domain, id: nft.id },
      { $set: { versions: nft.versions } }
    );
  }
};

export const updateDatabase = async (metadataChanges: UpdatedNftData[]) => {
  const client = new mongoDb.MongoClient(dbConnectionString);

  try {
    await client.connect();

    const collection = client.db(dbName).collection(dbCollectionName);

    for (const change of metadataChanges) {
      updateOneNft(collection, change);
    }
  } finally {
    client.close();
  }
};

export const getNftVersionFromDatabase = async (
  domain: string,
  id: string,
  blockNumber: number,
  logger: Logger
): Promise<Maybe<NftData>> => {
  logger(`Looking for NFT [${domain}] in database`);

  const databaseNft: Maybe<DatabaseNft> = await getDatabaseNFT(
    domain,
    id,
    logger
  );

  if (!databaseNft) {
    return undefined;
  }

  let i = databaseNft.versions.length - 1;
  for (i; i >= 0; --i) {
    // find the first block that is less than or equal to the block
    // we're looking for
    if (databaseNft.versions[i].blockNumber <= blockNumber) {
      break;
    }
  }

  if (i < 0) {
    logger(
      `NFT with domain [${domain}] and id [${id}] did not exist at block [${blockNumber}]`
    );
  }
  const nftVersion = databaseNft.versions[i];
  logger(
    `last update before block [${blockNumber}] was in block [${nftVersion.blockNumber}]`
  );

  const metadata = await getMetadataFromIpfs(
    nftVersion.metadataUri,
    5000,
    3,
    logger
  );

  if (!metadata) {
    return undefined;
  }

  return { domain: domain, id: id, metadata: metadata };
};

export const getNftArrayFromDatabase = async (
  nfts: { domain: string; id: string }[],
  logger: Logger
): Promise<Maybe<NftData>[]> => {
  logger("Getting Nft Array from database");

  const array: Maybe<NftData>[] = [];
  for (const nft of nfts) {
    array.push(
      await getNftVersionFromDatabase(
        nft.domain,
        nft.id,
        Number.MAX_SAFE_INTEGER,
        logger
      )
    );
  }

  return array;
};
