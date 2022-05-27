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

// still potentialy unsafe because of
// not checking if the underyling types of the variables are the same
export const isMetadata = (obj: any): obj is Metadata => {
  const data: Metadata = {
    name: "",
    description: "",
    image: "",
    animation_url: "",
    image_full: "",
    attributes: [],
  };
  const metadataKeys = Object.keys(data);
  const objKeysMap = new Set<string>(Object.keys(obj));

  for (const metadataKey of metadataKeys) {
    if (!objKeysMap.has(metadataKey)) {
      return false;
    }
  }

  return true;
};
