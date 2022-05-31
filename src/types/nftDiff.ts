import { MetadataChange } from ".";

export interface NFTDiff {
  domian?: string;
  id: string;
  changes: MetadataChange[];
}
