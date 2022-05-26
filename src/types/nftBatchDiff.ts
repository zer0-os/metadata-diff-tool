import { NFTDiff } from "./";

export interface NFTBatchDiff {
  summary: {
    [key: string]: number;
  };
  diffs: NFTDiff[];
}
