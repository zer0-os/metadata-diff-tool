import Ajv from "ajv";
import * as fs from "fs";
import { compareMetadataGeneric } from "./";
import { getNftsFromDatabase } from "../databaseAccess";
import {
  AjvError,
  Logger,
  Map,
  NftBatchDiff,
  NftData,
  NftDiff,
  NftFileData,
  nftArraySchema,
} from "../types";

const ajv = new Ajv();
const nftArraySchemaValidation = ajv.compile(nftArraySchema);

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

const readNftFile = (file: string): NftData[] => {
  const fileNfts: NftFileData = JSON.parse(fs.readFileSync(file).toString());
  if (!nftArraySchemaValidation(fileNfts.nfts)) {
    throw new AjvError(
      `Invalid nft array in [${file}]`,
      nftArraySchemaValidation
    );
  }

  return fileNfts.nfts;
};

export const compareNftGroups = (
  originalDataArray: NftData[],
  modifiedDataArray: NftData[],
  logger: Logger
): NftBatchDiff => {
  if (originalDataArray.length < modifiedDataArray.length) {
    throw Error(
      "Modified data array larger than original, modified data array must be a subset of the original array"
    );
  }

  const errors: {
    description: string;
    errors: string[];
  }[] = [];

  // validate both arrays
  logger("Validating Original NFT Data Array");
  const originalValidation = nftArraySchemaValidation(originalDataArray);
  if (!originalValidation) {
    const error = new AjvError(
      "Invalid OriginalDataArray",
      nftArraySchemaValidation
    );

    nftArraySchemaValidation.errors = [];
    errors.push(error);
    logger(errors);
  }

  const modifiedValidation = nftArraySchemaValidation(modifiedDataArray);
  if (!modifiedValidation) {
    const modifiedArrayErrors = new AjvError(
      "Invalid ModifiedDataArray",
      nftArraySchemaValidation
    );

    errors.push(modifiedArrayErrors);
    logger(errors);
  }

  if (!originalValidation || !modifiedValidation) {
    throw errors;
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
  logger(`Comparing NFT Files [${originalFile}] and [${modifiedFile}]`);
  const diff = compareNftGroups(
    readNftFile(originalFile),
    readNftFile(modifiedFile),
    logger
  );
  return diff;
};

export const compareNftGroupToDatabase = async (
  modifiedNfts: NftData[],
  logger: Logger
): Promise<NftBatchDiff> => {
  const nftDataForDatabase: { id: string }[] = [];

  for (const modified of modifiedNfts) {
    nftDataForDatabase.push({
      id: modified.id,
    });
  }

  const databaseNfts = await getNftsFromDatabase(nftDataForDatabase, logger);

  const diff = compareNftGroups(databaseNfts, modifiedNfts, logger);
  return diff;
};

export const compareNftFileToDatabase = async (
  modifiedFile: string,
  logger: Logger
): Promise<NftBatchDiff> => {
  const modifiedNfts = readNftFile(modifiedFile);
  const diff = await compareNftGroupToDatabase(modifiedNfts, logger);
  return diff;
};
