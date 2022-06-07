import * as fs from "fs";
import { compareMetadataGeneric } from "./compareMetadata";
import {
  NftData,
  NftDiff,
  NftBatchDiff,
  Map,
  NftFileData,
  Logger,
} from "./types";
import Ajv from "ajv";
import { nftArraySchema } from "./ajvSchemas";

const ajv = new Ajv();

const compareNfts = (
  original: NftData,
  modified: NftData,
  logger: Logger
): NftDiff => {
  logger(
    `Validating that [${original.id}] and [${modified.id}] are the same NFT`
  );

  if (original.domain != modified.domain) {
    throw Error(
      `Original NFT domain [${original.domain}] and modified NFT domain [${modified.domain}] do not match`
    );
  } else if (original.id != modified.id) {
    throw Error(
      `Original NFT id [${original.id}] and modified NFT id [${modified.id}] do not match`
    );
  }

  const diff: NftDiff = {
    domain: original.domain,
    id: original.id,
    changes: [],
  };

  diff.changes = compareMetadataGeneric(
    original.metadata,
    modified.metadata,
    logger
  );

  logger(`NFT [${original.id}] has [${diff.changes.length}] total changes`);

  return diff;
};

export const compareNftGroups = (
  originalDataArray: NftData[],
  modifiedDataArray: NftData[],
  logger: Logger
): NftBatchDiff => {
  // compile the nft Schema
  const nftFileSchemaValidation = ajv.compile(nftArraySchema);

  // validate both arrays
  logger("Validating Original NFT Data Array");
  const originalValidation = nftFileSchemaValidation(originalDataArray);
  if (!originalValidation) {
    logger("Invalid Original NFT Data given");
    throw Error("Invalid originalDataArray given to compareNftGroups");
  }

  logger("Validating Modified NFT Data Array");
  const modifiedValidation = nftFileSchemaValidation(modifiedDataArray);
  if (!modifiedValidation) {
    logger("Invalid Modified NFT Data Array given");
    throw Error("Invalid modifiedDataArray given to compareNftGroups");
  }

  const batchDiff: NftBatchDiff = { summary: {}, diffs: [] };

  const originalsMap: Map<NftData> = {};

  logger("Creating Map of original data");
  // add each original NFT to a map, throw if there are duplicates
  originalDataArray.forEach((original) => {
    if (originalsMap[original.id] !== undefined) {
      throw Error(
        `Duplicated NFT [${original.id}] found in the originalDataArray`
      );
    }
    originalsMap[original.id] = original;
  });

  logger("Validating the Modified array is a subset of the Original array");
  modifiedDataArray.forEach((modified) => {
    const path = modified.id;
    const original = originalsMap[path];

    // make sure that there is a corresponding modified NFT to this original,
    // this could catch duplicates in the modified map as well since they would have
    // been removed on their first diff check
    if (original === undefined) {
      throw Error(
        `Modified NFT [${modified.domain}, ${modified.id}] does not have a matching counterpart in original NFTs`
      );
    }

    // get the diff of these specific NFTs
    const diff = compareNfts(original, modified, logger);

    // for each change, increment the number of changes that trait has
    diff.changes.forEach((change) => {
      const summaryAtKey = batchDiff.summary[change.key];
      batchDiff.summary[change.key] = summaryAtKey ? summaryAtKey + 1 : 1;
    });

    // add this diff to the total number of diffs if it has any changes
    if (diff.changes.length) {
      batchDiff.diffs.push(diff);
    }

    // remove this NFT from the modified map
    // so that we can check for extras at the end
    delete originalsMap[path];
  });

  return batchDiff;
};

export const compareNftFiles = (
  originalFile: string,
  modifiedFile: string,
  logger: Logger
): NftBatchDiff => {
  const file1Nfts: NftFileData = JSON.parse(
    fs.readFileSync(originalFile).toString()
  );
  const file2Nfts: NftFileData = JSON.parse(
    fs.readFileSync(modifiedFile).toString()
  );

  logger(`Comparing NFT Files [${originalFile}] and [${modifiedFile}]`);

  return compareNftGroups(file1Nfts.nfts, file2Nfts.nfts, logger);
};
