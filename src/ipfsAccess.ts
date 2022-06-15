import Ajv from "ajv";
import axios from "axios";
import { metadataSchema } from "./ajvSchemas";
import { AjvError, Logger, Maybe, Metadata } from "./types";

const ajv = new Ajv();
const metadataVerification = ajv.compile(metadataSchema);

const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getMetadataFromIpfs = async (
  ipfsAddress: string,
  timeoutStep: number,
  maxTimeouts: number,
  logger: Logger
): Promise<Maybe<Metadata>> => {
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

  logger(`Looking for Metadata at [${fullUrl}]`);

  let metadata: Maybe<Metadata> = undefined;

  for (let i = 0; i < maxTimeouts; ++i) {
    const websiteResult = await axios.get(fullUrl);
    metadata = websiteResult.data;

    if (!metadata) {
      delay((i + 1) * timeoutStep);
    } else break;
  }

  if (metadata && !metadataVerification(metadata)) {
    throw new AjvError(
      "Invalid Metadata found in database",
      metadataVerification
    );
  } else if (!metadata) {
    logger(`Could not retrive Metadata at [${fullUrl}]`);
  }

  return metadata;
};
