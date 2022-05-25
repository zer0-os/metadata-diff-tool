export enum MetadataChangeType {
  Add,
  Remove,
  Modify,
}

export interface MetadataChange {
  type: MetadataChangeType;
  key: string;
}

export interface MetadataChangeAddAttribute extends MetadataChange {
  new: string;
}

export interface MetadataChangeRemoveAttribute extends MetadataChange {
  old: string;
}

export interface MetadataChangeModifyAttribute extends MetadataChange {
  old: string;
  new: string;
}

export interface MetadataChangeModifyValue extends MetadataChange {
  old: string;
  new: string;
}
