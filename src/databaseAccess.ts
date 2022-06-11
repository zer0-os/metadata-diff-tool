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

const ajv = new Ajv();

export const updateDatabase = async (metadataChanges: UpdatedNftData[]) => {
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

  const client = new mongoDb.MongoClient(dbConnectionString);
  const databaseNftVerification = ajv.compile(databaseNftSchema);

  try {
    await client.connect();

    const database = client.db(dbName);
    const collection = database.collection(dbCollectionName);

    for (const change of metadataChanges) {
      const nft = await collection.findOne<DatabaseNft>({
        domain: change.domain,
        id: change.id,
      });

      if (!nft) {
        throw Error(
          `NFT with domain [${change.domain}] and id [${change.domain}] was not found in database`
        );
      } else if (!databaseNftVerification(nft)) {
        throw new AjvError(
          `Nft does not fulfill the database Nft Schema`,
          databaseNftVerification
        );
      }

      nft.versions.push({
        metadataUri: change.metadataUri,
        blockNumber: change.blockNumber,
      });

      await collection.updateOne(
        { _id: nft._id },
        { $set: { versions: nft.versions } }
      );
    }
  } finally {
    client.close();
  }
};

export const getNftDataFromDatabase = async (
  domain: string,
  id: string,
  blockNumber: number,
  logger: Logger
): Promise<Maybe<NftData>> => {
  const nft: Maybe<NftData> = undefined;
  logger(`Looking for NFT [${domain}] in database`);
  return nft;
};

export const getNftArrayFromDatabase = async (
  nfts: DatabaseNft[],
  logger: Logger
): Promise<Maybe<NftData>[]> => {
  logger("Getting Nft Array from database");
  const array: Maybe<NftData>[] = [];
  return array;
};
