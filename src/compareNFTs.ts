import * as fs from "fs";
import { compareMetadataGeneric } from "./compareMetadata";
import { NftData, NftDiff, NftBatchDiff, Map, NftFileData } from "./types";
import Ajv from "ajv";
import { nftArraySchema } from "./ajvSchemas";

const ajv = new Ajv();

const compareNfts = (original: NftData, modified: NftData): NftDiff => {
  if (original.domain != modified.domain) {
    throw Error(
      `Original NFT domain [${original.domain}] and modified NFT domain [${modified.domain}] do not match`
    );
  } else if (original.id != modified.id) {
    throw Error(
      `Original NFT hexID [${original.id}] and modified NFT hexID [${modified.id}] do not match`
    );
  }

  const diff: NftDiff = {
    domain: original.domain,
    id: original.id,
    changes: [],
  };

  diff.changes = compareMetadataGeneric(original.metadata, modified.metadata);

  return diff;
};

export const compareNftGroups = (
  originalDataArray: NftData[],
  modifiedDataArray: NftData[]
): NftBatchDiff => {
  // compile the nft Schema
  const nftFileSchemaValidation = ajv.compile(nftArraySchema);

  // validate both arrays
  const originalValidation = nftFileSchemaValidation(originalDataArray);
  const modifiedValidation = nftFileSchemaValidation(modifiedDataArray);

  if (!originalValidation) {
    console.log("Invalid OriginalDataArray given");
  }
  if (!modifiedValidation) {
    console.log("Invalid ModifiedDataArray given");
  }

  if (!originalValidation || !modifiedValidation) {
    throw Error("Invalid data given to compareNftGroups");
  }

  const batchDiff: NftBatchDiff = { summary: {}, diffs: [] };

  const originalsMap: Map<NftData> = {};

  // add each original NFT to a map, throw if there are duplicates
  originalDataArray.forEach((original) => {
    if (originalsMap[original.id] !== undefined) {
      throw Error(
        `Duplicated NFT [${original.id}] found in the originalDataArray`
      );
    }
    originalsMap[original.id] = original;
  });

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
    const diff = compareNfts(original, modified);

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
  modifiedFile: string
): NftBatchDiff => {
  const file1Nfts: NftFileData = JSON.parse(
    fs.readFileSync(originalFile).toString()
  );
  const file2Nfts: NftFileData = JSON.parse(
    fs.readFileSync(modifiedFile).toString()
  );

  return compareNftGroups(file1Nfts.nfts, file2Nfts.nfts);
};
