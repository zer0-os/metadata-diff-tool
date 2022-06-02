import * as fs from "fs";
import { compareMetadataGeneric } from "./compareMetadata";
import { NftData, NftDiff, NftBatchDiff } from "./types";

interface NftDataMap {
  [key: string]: NftData;
}

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
    domian: original.domain,
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
  const batchDiff: NftBatchDiff = { summary: {}, diffs: [] };

  const modifiedsMap: NftDataMap = {};

  // add each modified NFT to a map, throw if there are duplicates
  modifiedDataArray.forEach((modified) => {
    if (modifiedsMap[modified.id] !== undefined) {
      throw Error(
        `Duplicated NFT [${modified.id}] found in the modifiedDataArray`
      );
    }
    modifiedsMap[modified.id] = modified;
  });

  originalDataArray.forEach((original) => {
    const path = original.id;
    const modified = modifiedsMap[path];

    // make sure that there is a corresponding modified NFT to this original
    if (modified === undefined) {
      throw Error(
        `Original NFT [${original.domain}, ${original.id}] does not have a matching counterpart in modifieds`
      );
    }

    // get the diff of these specific NFTs
    const diff = compareNfts(original, modified);

    // for each change, increment the number of changes that trait has
    diff.changes.forEach((change) => {
      const summaryAtKey = batchDiff.summary[change.key];
      batchDiff.summary[change.key] = summaryAtKey ? summaryAtKey + 1 : 1;
    });

    // add this diff to the total number of diffs
    batchDiff.diffs.push(diff);

    // remove this NFT from the modified map
    // so that we can check for extras at the end
    delete modifiedsMap[path];
  });

  if (modifiedsMap.size) {
    throw Error(`Extra modified NFTs given [${modifiedsMap}]`);
  }

  return batchDiff;
};

export const compareNftFiles = (
  originalFile: string,
  modifiedFile: string
): NftBatchDiff => {
  const file1Nfts: { nfts: NftData[] } = JSON.parse(
    fs.readFileSync(originalFile).toString()
  );
  const file2Nfts: { nfts: NftData[] } = JSON.parse(
    fs.readFileSync(modifiedFile).toString()
  );

  return compareNftGroups(file1Nfts.nfts, file2Nfts.nfts);
};
