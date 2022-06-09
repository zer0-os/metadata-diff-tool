import Ajv from "ajv";
import axios from "axios";
import { nftSchema } from "./ajvSchemas";
import { Maybe, NftData, AjvError } from "./types";

const ajv = new Ajv();
const nftDataVerification = ajv.compile(nftSchema);

const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getNftFromIpfs = async (
  ipfsAddress: string,
  timeoutStep: number,
  maxTimeouts: number
): Promise<Maybe<NftData>> => {
  const ipfsPrefix = process.env.ipfsPrefix;
  const gatewayPrefix = process.env.ipfsGatewayUrlPrefix;

  if (!ipfsPrefix) {
    throw Error("No ipfsPrefix in environment variables");
  } else if (!gatewayPrefix) {
    throw Error("No ipfsGatewayUrlPrefix in environment variables");
  }

  const prefixIndex = ipfsAddress.indexOf(ipfsPrefix);
  const mainUrl = ipfsAddress.slice(prefixIndex + ipfsPrefix.length);
  const fullUrl = gatewayPrefix + mainUrl;

  let nft: Maybe<NftData> = undefined;

  for (let i = 0; i < maxTimeouts; ++i) {
    nft = (await axios.get(fullUrl)).data;

    if (!nft) {
      delay(i * timeoutStep);
    } else break;
  }

  if (nft && !nftDataVerification(nft)) {
    throw new AjvError("Invalid NFT found in database", nftDataVerification);
  }

  return nft;
};
