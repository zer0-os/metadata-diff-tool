export interface MetadataChange {
  readonly type: string;
  readonly key: string;
}

export class MetadataChangeAdd<T> implements MetadataChange {
  constructor(key: string, value: T) {
    this.key = key;
    this.new = value;
  }

  readonly type = "Add";
  readonly key: string;
  readonly new: T;
}

export class MetadataChangeRemove<T> implements MetadataChange {
  constructor(key: string, value: T) {
    this.key = key;
    this.old = value;
  }

  readonly type = "Remove";
  readonly key: string;
  readonly old: T;
}

export class MetadataChangeModify<OldType, NewType> implements MetadataChange {
  constructor(key: string, old: OldType, value: NewType) {
    this.key = key;
    this.old = old;
    this.new = value;
  }

  readonly type = "Modify";
  readonly key: string;
  readonly old: OldType;
  readonly new: NewType;
}
