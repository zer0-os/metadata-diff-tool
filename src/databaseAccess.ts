import Ajv from "ajv";
import { DatabaseNft, NftData, Maybe, Logger } from "./types";
import { getNftFromIpfs } from "./ipfsAccess";

const updateDatabase = async (metadataChanges: DatabaseNft[]) => {
  const nftSchemaVerification = new Ajv();

  for (const change of metadataChanges) {
    const maybeNft = await getNftFromIpfs(
      change.metadataUri,
      3000,
      3,
      console.debug
    );

    if (maybeNft) {
    }
  }
};

export const getNftDataFromDatabase = async (
  domain: string,
  blockNumber: number,
  logger: Logger
): Promise<Maybe<DatabaseNft>> => {
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
