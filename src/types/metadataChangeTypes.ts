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

export class MetadataChangeModifyMember implements MetadataChange {
  constructor(key: string, oldValue: string, newValue: string) {
    this.key = key;
    this.old = oldValue;
    this.new = newValue;
  }
  readonly description = "Modified a Member";
  readonly key: string;
  readonly old: string;
  readonly new: string;
}
