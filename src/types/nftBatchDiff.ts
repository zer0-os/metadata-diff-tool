import { NftDiff } from "./";

export interface NftBatchDiff {
  summary: {
    [key: string]: number;
  };
  diffs: NftDiff[];
}
