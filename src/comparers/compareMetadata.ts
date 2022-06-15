import {
  Logger,
  Map,
  Metadata,
  MetadataAttribute,
  MetadataChange,
  MetadataChangeAdd,
  MetadataChangeModify,
  MetadataChangeRemove,
} from "../types";

const compareMetadataAttributes = (
  originalAttributes: readonly MetadataAttribute[],
  modifiedAttributes: readonly MetadataAttribute[],
  logger: Logger
): MetadataChange[] => {
  logger("Comparing Metadata Attributes");
  const attributeKeyPrefix = "Attribute.";
  const changes: MetadataChange[] = [];

  // construct a map of the second attribs
  const newAttributesMap: Map<string> = {};

  modifiedAttributes.forEach((attribute) => {
    newAttributesMap[attribute.trait_type] = attribute.value;
  });

  logger("Finding Removed or Modified Metadata Attributes");
  let removed = 0;
  let modified = 0;
  // walk through all currentState attributes,
  // check if they still exist or have changed
  for (const originalAttribute of originalAttributes) {
    const traitType = originalAttribute.trait_type;
    const newAttributeValues = newAttributesMap[traitType];

    // if this attribute exists in the modified state, check if it changes
    if (newAttributeValues !== undefined) {
      if (newAttributeValues != originalAttribute.value) {
        ++modified;
        changes.push(
          new MetadataChangeModify(
            attributeKeyPrefix + traitType,
            originalAttribute.value,
            newAttributeValues
          )
        );
      }

      delete newAttributesMap[traitType]; // remove this attribute from the map
    }
    // this attribute does not exist anymore in the modified state
    else {
      ++removed;
      changes.push(
        new MetadataChangeRemove(
          attributeKeyPrefix + traitType,
          originalAttribute.value
        )
      );
    }
  }

  // loop through all attributes that were not in the original state,
  // mark them as Attribute Additions

  const newAttributesArray = Object.keys(newAttributesMap).map((key) => {
    return {
      key: attributeKeyPrefix + key,
      value: newAttributesMap[key],
    };
  });

  let added = 0;
  logger("Finding Added Metadata Attributes");
  newAttributesArray.forEach(({ key, value }) => {
    ++added;
    changes.push(new MetadataChangeAdd(key, value));
  });

  logger(`NFT has [${added}] added Attributes`);
  logger(`NFT has [${modified}] modified Attributes`);
  logger(`NFT has [${removed}] removed Attributes`);

  return changes;
};

export const compareMetadataGeneric = <
  OriginalType extends Metadata,
  ModifiedType extends Metadata
>(
  original: OriginalType,
  modified: ModifiedType,
  logger: Logger
): MetadataChange[] => {
  logger("Comparing NFT Metadata");

  const memberChanges = compareMetadataMembersGeneric(
    original,
    modified,
    logger
  );
  const attributeChanges = compareMetadataAttributes(
    original.attributes,
    modified.attributes,
    logger
  );

  const changes = memberChanges.concat(attributeChanges);
  return changes;
};

export const compareMetadataMembersGeneric = <
  OriginalType extends Metadata,
  ModifiedType extends Metadata
>(
  originals: OriginalType,
  modifieds: ModifiedType,
  logger: Logger
): MetadataChange[] => {
  logger("Comparing Metadata Members");
  const changes: MetadataChange[] = [];

  const originalKeys = Object.entries(originals);
  const modifiedsMap: Map<any> = {};

  Object.entries(modifieds).forEach(([key, value]) => {
    modifiedsMap[key] = value;
  });

  let modified = 0;
  let removed = 0;
  logger("Finding Removed and Modified Metadata Members");
  originalKeys.forEach(([key, value]) => {
    if (key == "attributes") {
      delete modifiedsMap[key];
      return;
    }

    const modifiedValue = modifiedsMap[key];

    if (modifiedValue === undefined) {
      ++removed;
      changes.push(new MetadataChangeRemove(key, value));
    } else if (value != modifiedValue) {
      ++modified;
      changes.push(new MetadataChangeModify(key, value, modifiedValue));
    }

    delete modifiedsMap[key];
  });

  const modifiedsArray = Object.keys(modifiedsMap).map((key) => {
    return {
      key: key,
      value: modifiedsMap[key],
    };
  });

  let added = 0;
  logger("Finding Added Metadata Members");
  modifiedsArray.forEach((obj) => {
    ++added;
    changes.push(new MetadataChangeAdd(obj.key, obj.value));
  });

  logger(`NFT has [${added}] added Members`);
  logger(`NFT has [${modified}] modified Members`);
  logger(`NFT has [${removed}] removed Members`);

  return changes;
};
