import { JSONSchemaType } from "ajv";
import { DatabaseNft, Metadata, MetadataAttribute, NftData } from "../";

const metadataAttributeSchema: JSONSchemaType<MetadataAttribute> = {
  type: "object",
  properties: {
    trait_type: { type: "string", nullable: false },
    value: { type: "string", nullable: false },
  },
  required: ["trait_type", "value"],
  additionalProperties: false,
};

export const metadataSchema: JSONSchemaType<Metadata> = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    image: { type: "string", nullable: true },
    animation_url: { type: "string", nullable: true },
    image_full: { type: "string", nullable: true },
    attributes: {
      type: "array",
      minItems: 0,
      items: metadataAttributeSchema,
    },
  },
  required: ["name", "description"],
  anyOf: [
    { required: ["image"] },
    { required: ["animation_url"] },
    { required: ["image_full"] },
  ],
  additionalProperties: true,
};

export const nftSchema: JSONSchemaType<NftData> = {
  type: "object",
  properties: {
    domain: { type: "string", nullable: true },
    id: { type: "string" },
    metadata: metadataSchema,
  },
  required: ["id", "metadata"],
};

export const nftArraySchema: JSONSchemaType<NftData[]> = {
  type: "array",
  items: nftSchema,
};

export const databaseNftSchema: JSONSchemaType<DatabaseNft> = {
  type: "object",
  properties: {
    id: { type: "string" },
    blockNumber: { type: "number" },
    metadataUri: { type: "string" },
    metadata: metadataSchema,
  },
  required: ["id", "blockNumber", "metadataUri", "metadata"],
};
