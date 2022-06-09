import Ajv from "ajv";
import axios from "axios";
import { DatabaseNft, NftData, Maybe } from "./types";
import { nftSchema } from "./ajvSchemas";
import { string } from "yargs";
import { AjvError } from "./types/ajvError";
import { getNftFromIpfs } from "./ipfsAccess";

const updateDatabase = async (metadataChanges: DatabaseNft[]) => {
  const nftSchemaVerification = new Ajv();

  for (const change of metadataChanges) {
    const nft = getNftFromIpfs(change.metadataUri);
  }
};

export const getNftDataFromDatabase = async (
  nftData: DatabaseNft
): Promise<Maybe<NftData>> => {
  const ipfsPrefix = process.env.ipfsPrefix;
  const gatewayPrefix = process.env.ipfsGatewayUrlPrefix;

  if (!ipfsPrefix) {
    throw Error("No ipfsPrefix in environment variables");
  } else if (!gatewayPrefix) {
    throw Error("No ipfsGatewayUrlPrefix in environment variables");
  }

  const prefixIndex = nftData.metadataUri.indexOf(ipfsPrefix);
  const mainUrl = nftData.metadataUri.slice(prefixIndex + ipfsPrefix.length);
  const fullUrl = gatewayPrefix + mainUrl;

  const nft: NftData = (await axios.get(fullUrl)).data;

  if (nft && !nftDataVerification(nft)) {
    throw new AjvError("Invalid NFT found in database", nftDataVerification);
  }

  return nft;
};

export const getNftDataArrayFromDatabase = async (
  nfts: DatabaseNft[]
): Promise<NftData[]> => {};
