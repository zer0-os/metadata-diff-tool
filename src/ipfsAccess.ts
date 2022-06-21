import Ajv from "ajv";
import axios from "axios";
import { AjvError, Logger, Maybe, Metadata, metadataSchema } from "./types";
import { delay, getIpfsEnvGateway } from "./utility";

const ajv = new Ajv();
const metadataVerification = ajv.compile(metadataSchema);

export const getMetadataFromIpfs = async (
  ipfsAddress: string,
  timeoutStep: number,
  maxTimeouts: number,
  logger: Logger
): Promise<Maybe<Metadata>> => {
  const ipfsGatewayPrefix = getIpfsEnvGateway();

  // match anything up to and including ipfs:// or ipfs/
  const ipfsRegex = /(.*ipfs:\/\/)|(.*ipfs\/)/gi;

  const fullUrl = ipfsAddress.replace(ipfsRegex, ipfsGatewayPrefix);

  logger(`Looking for Metadata at [${fullUrl}]`);

  let metadata: Maybe<Metadata>;

  for (let i = 0; i < maxTimeouts && !metadata; ++i) {
    await delay(i * timeoutStep);

    try {
      const websiteResult = await axios.get(fullUrl);
      metadata = websiteResult.data;
    } catch (e) {
      logger(e);
    }
  }

  if (metadata && !metadataVerification(metadata)) {
    throw new AjvError(
      "Invalid Metadata found in database",
      metadataVerification
    );
  } else if (!metadata) {
    logger(`Could not retrive Metadata at [${fullUrl}]`);
  } else {
    logger(`Found Metadata as [${fullUrl}]`);
  }

  return metadata;
};
