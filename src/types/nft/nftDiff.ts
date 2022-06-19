import { MetadataChange } from "..";

export interface NftDiff {
  domain?: string;
  id: string;
  changes: MetadataChange[];
}
