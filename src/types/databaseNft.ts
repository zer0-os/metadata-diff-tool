import { NftData } from "./";

export interface DatabaseNft {
  domain: string;
  id: string;
  versions: {
    metadataUri: string;
    blockNumber: number;
  }[];
}
