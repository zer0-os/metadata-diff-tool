import { MetadataChange } from ".";

export interface NFTDiff {
  domian?: string;
  hexID: string;
  changes: MetadataChange[];
}
