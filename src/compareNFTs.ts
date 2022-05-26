import { compareMetadata } from "./compareMetadata";
import { NFTData, NFTDiff, NFTBatchDiff } from "./types";

export const compareNFTs = (original: NFTData, modified: NFTData): NFTDiff => {
  if (original.domain != modified.domain) {
    throw Error(
      `Original NFT domain [${original.domain}] and modified NFT domain [${modified.domain}] do not match`
    );
  } else if (original.hexID != modified.hexID) {
    throw Error(
      `Original NFT hexID [${original.hexID}] and modified NFT hexID [${modified.hexID}] do not match`
    );
  }

  const diff: NFTDiff = {
    domian: original.domain,
    hexID: original.hexID,
    changes: [],
  };

  diff.changes = compareMetadata(original.data, modified.data);

  return diff;
};

export const compareNFTGroups = (
  originals: NFTData[],
  modifieds: NFTData[]
): NFTBatchDiff => {
  const batchDiff: NFTBatchDiff = { summary: {}, diffs: [] };

  let modifiedMap = new Map<string, NFTData>();

  modifieds.forEach((data) => {
    const path = data.domain + data.hexID;
    modifiedMap.set(path, data);
  });

  originals.forEach((original) => {
    const path = original.domain + original.hexID;
    const modified = modifiedMap.get(path);

    // make sure that there is a corresponding modified NFT to this original
    if (modified === undefined) {
      throw Error(
        `Original NFT [${original.domain}, ${original.hexID}] does not have a matching counterpart in modifieds`
      );
    }

    // get the diff of these specific NFTs
    const diff = compareNFTs(original, modified);

    // for each change, increment the number of changes that trait has
    diff.changes.forEach((change) => {
      let numSummaryChanges = batchDiff.summary[change.key];
      if (numSummaryChanges === undefined) {
        numSummaryChanges = 1;
      } else {
        ++numSummaryChanges;
      }

      batchDiff.summary[change.key] = numSummaryChanges;
    });

    // add this diff to the total number of diffs
    batchDiff.diffs.push(diff);

    // remove this NFT from the modified map
    // so that we can check for extras at the end
    modifiedMap.delete(path);
  });

  if (modifiedMap.size) {
    throw Error(`Extra modified NFTs given [${modifiedMap}]`);
  }

  return batchDiff;
};
