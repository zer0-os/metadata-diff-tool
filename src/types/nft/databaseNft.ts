import { Metadata } from "..";

export interface DatabaseNft {
  id: string;
  blockNumber: number;
  metadataUri: string;
  metadata: Metadata;
}
