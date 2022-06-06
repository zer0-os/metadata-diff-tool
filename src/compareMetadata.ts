import {
  Metadata,
  MetadataAttribute,
  MetadataChangeModify,
  MetadataChange,
  MetadataChangeRemove,
  MetadataChangeAdd,
  Map,
} from "./types";

const compareMetadataAttributes = (
  originalAttributes: readonly MetadataAttribute[],
  modifiedAttributes: readonly MetadataAttribute[]
): MetadataChange[] => {
  const attributeKeyPrefix = "Attribute.";
  const changes: MetadataChange[] = [];

  // construct a map of the second attribs
  const newAttributesMap: Map<string> = {};

  modifiedAttributes.forEach((attribute) => {
    newAttributesMap[attribute.trait_type] = attribute.value;
  });

  // walk through all currentState attributes,
  // check if they still exist or have changed
  for (const originalAttribute of originalAttributes) {
    const traitType = originalAttribute.trait_type;
    const newAttributeValues = newAttributesMap[traitType];

    // if this attribute exists in the modified state, check if it changes
    if (newAttributeValues !== undefined) {
      if (newAttributeValues != originalAttribute.value) {
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

  newAttributesArray.forEach(({ key, value }) => {
    changes.push(new MetadataChangeAdd(key, value));
  });

  return changes;
};

export const compareMetadataGeneric = <
  OriginalType extends Metadata,
  ModifiedType extends Metadata
>(
  original: OriginalType,
  modified: ModifiedType
): MetadataChange[] => {
  const memberChanges = compareMetadataMembersGeneric(original, modified);
  const attributeChanges = compareMetadataAttributes(
    original.attributes,
    modified.attributes
  );

  return memberChanges.concat(attributeChanges);
};

export const compareMetadataMembersGeneric = <
  OriginalType extends Metadata,
  ModifiedType extends Metadata
>(
  originals: OriginalType,
  modifieds: ModifiedType
): MetadataChange[] => {
  const changes: MetadataChange[] = [];

  const originalKeys = Object.entries(originals);
  const modifiedsMap: Map<any> = {};

  Object.entries(modifieds).forEach(([key, value]) => {
    modifiedsMap[key] = value;
  });

  originalKeys.forEach(([key, value]) => {
    if (key == "attributes") {
      delete modifiedsMap[key];
      return;
    }

    const modifiedValue = modifiedsMap[key];

    if (modifiedValue === undefined) {
      changes.push(new MetadataChangeRemove(key, value));
    } else if (value != modifiedValue) {
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

  modifiedsArray.forEach((obj) => {
    changes.push(new MetadataChangeAdd(obj.key, obj.value));
  });

  return changes;
};
