import { MetadataChange } from "./metadataChangeTypes";

export interface MetadataDiff {
  changes: MetadataChange[];
}

export const combineMetadatas = (...diffs: MetadataDiff[]): MetadataDiff => {
  const cumulativeDiff: MetadataDiff = { changes: [] };

  for (const diff of diffs) {
    cumulativeDiff.changes = cumulativeDiff.changes.concat(diff.changes);
  }

  return cumulativeDiff;
};
