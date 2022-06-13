import { WithId, Document } from "mongodb";

export interface DatabaseNftVersion {
  metadataUri: string;
  blockNumber: number;
}

export interface DatabaseNft {
  domain: string;
  id: string;
  versions: DatabaseNftVersion[];
}
