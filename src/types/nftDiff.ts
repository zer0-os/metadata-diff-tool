import { MetadataChange } from ".";

export interface NftDiff {
  domian?: string;
  id: string;
  changes: MetadataChange[];
}
