export interface MetadataChange {
  readonly description: string;
  readonly key: string;
}

export class MetadataChangeAddAttribute implements MetadataChange {
  constructor(key: string, newValue: string) {
    this.key = key;
    this.new = newValue;
  }

  readonly description = "Added an Attribute";
  readonly key: string;
  readonly new: string;
}

export class MetadataChangeRemoveAttribute implements MetadataChange {
  constructor(key: string, oldValue: string) {
    this.key = key;
    this.old = oldValue;
  }
  readonly description = "Removed an Attribute";
  readonly key: string;
  readonly old: string;
}

export class MetadataChangeModifyAttribute implements MetadataChange {
  constructor(key: string, oldValue: string, newValue: string) {
    this.key = key;
    this.old = oldValue;
    this.new = newValue;
  }

  readonly description = "Modified an Attribute";
  readonly key: string;
  readonly old: string;
  readonly new: string;
}

export class MetadataChangeAddMember<T> implements MetadataChange {
  constructor(key: string, newValue: T) {
    this.key = key;
    this.new = newValue;
  }

  description = `Added a Member`;
  key: string;
  new: T;
}

export class MetadataChangeRemoveMember<T> implements MetadataChange {
  constructor(key: string, oldValue: T) {
    this.key = key;
    this.old = oldValue;
  }

  description = `Removed a Member`;
  key: string;
  old: T;
}

export class MetadataChangeModifyMember<OldType, NewType>
  implements MetadataChange
{
  constructor(key: string, oldValue: OldType, newValue: NewType) {
    this.key = key;
    this.old = oldValue;
    this.new = newValue;
  }

  description = `Modified a Member`;
  key: string;
  old: OldType;
  new: NewType;
}
