import Ajv from "ajv";
import {
  DatabaseNft,
  NftData,
  Maybe,
  Logger,
  UpdatedNftData,
  AjvError,
  databaseNftSchema,
} from "./types";
import * as mongoDb from "mongodb";
import { getMetadataFromIpfs } from "./ipfsAccess";
import { getDatabaseEnvVars } from "./utility";

const ajv = new Ajv();
const databaseNftVerification = ajv.compile(databaseNftSchema);

const getDatabaseNFT = async (
  client: mongoDb.MongoClient,
  id: string,
  logger: Logger
): Promise<Maybe<DatabaseNft>> => {
  const dbVars = getDatabaseEnvVars();

  const collection = client.db(dbVars.name).collection(dbVars.collection);

  logger(`Searching MongoDb for NFT with id [${id}]`);
  const nft = await collection.findOne<DatabaseNft>({
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
};

import axios, { AxiosRequestConfig } from "axios";

export const updateDatabase = async (metadataChanges: UpdatedNftData[]) => {
  try {
    const config: AxiosRequestConfig = {
      maxRedirects: 0,
    };
    const test = await axios.get(
      "https://ipfs.io/ipfs/QmPh6EjzvgUQhYP9wz4JDprEMvXRp7xg15aQM3NtygNca7",
      config
    );
    console.log(test);
  } catch (e: any) {
    console.log(e);
  }

  const dbVars = getDatabaseEnvVars();
  const client = new mongoDb.MongoClient(dbVars.connection);

  try {
    await client.connect();
    const collection = client.db(dbVars.name).collection(dbVars.collection);
    await collection.deleteMany({});

    const databaseNfts: DatabaseNft[] = [];

    for (const change of metadataChanges) {
      const metadata = await getMetadataFromIpfs(
        change.metadataUri,
        0,
        1,
        console.debug
      );

      if (!metadata) {
        continue;
      }

      const databaseNft: DatabaseNft = {
        id: change.id,
        metadataUri: change.metadataUri,
        blockNumber: change.blockNumber,
        metadata: metadata,
      };

      databaseNfts.push(databaseNft);
    }

    await collection.insertMany(databaseNfts);
  } finally {
    await client.close();
  }
};

export const getNftVersionFromDatabase = async (
  client: mongoDb.MongoClient,
  id: string,
  blockNumber: number = Number.MAX_SAFE_INTEGER,
  logger: Logger
): Promise<Maybe<NftData>> => {
  logger(`Looking for NFT [${id}] in database`);
  const dbVars = getDatabaseEnvVars();
  const collection = client.db(dbVars.name).collection(dbVars.collection);

  const databaseNfts = await collection.find<DatabaseNft>({ id: id });

  let closestNft: Maybe<DatabaseNft>;

  await databaseNfts.forEach((data) => {
    if (
      data.blockNumber < blockNumber &&
      (!closestNft || data.blockNumber > closestNft.blockNumber)
    ) {
      closestNft = data;
    }
  });

  if (!closestNft) {
    logger(`NFT with id [${id}] did not exist at block [${blockNumber}]`);
  } else {
    logger(
      `last update before block [${blockNumber}] was in block [${closestNft.blockNumber}]`
    );
  }

  return closestNft;
};

export const getNftsFromDatabase = async (
  nfts: { id: string }[],
  logger: Logger
): Promise<NftData[]> => {
  logger("Getting Nft Array from database");
  const dbVars = getDatabaseEnvVars();
  const client = new mongoDb.MongoClient(dbVars.connection);
  try {
    await client.connect();
    const array: NftData[] = [];

    for (const nft of nfts) {
      const databaseNft = await getNftVersionFromDatabase(
        client,
        nft.id,
        undefined,
        logger
      );

      if (databaseNft) {
        array.push(databaseNft);
      }
    }

    return array;
  } finally {
    await client.close();
  }
};
