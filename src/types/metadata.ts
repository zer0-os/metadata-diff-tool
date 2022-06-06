export interface Metadata {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  image_full: string;
  attributes: MetadataAttribute[];
}

export interface MetadataAttribute {
  trait_type: string;
  value: string;
}
