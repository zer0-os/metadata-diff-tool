import {
  Metadata,
  MetadataAttribute,
  MetadataChangeModifyMember,
  MetadataChangeRemoveAttribute,
  MetadataChangeModifyAttribute,
  MetadataChangeAddAttribute,
  MetadataChange,
  MetadataChangeRemoveMember,
  MetadataChangeAddMember,
  isMetadata,
} from "./types";

export const compareMetadata = (
  first: Metadata,
  second: Metadata
): MetadataChange[] => {
  const valueChanges = compareMetadataValues(first, second);
  const attributeChanges = compareMetadataAttributes(
    first.attributes,
    second.attributes
  );

  return valueChanges.concat(attributeChanges);
};

const compareMetadataValues = (
  first: Metadata,
  second: Metadata
): MetadataChange[] => {
  const changes: MetadataChange[] = [];

  // get the name and values of each member in Metadata as strings
  // attributes become arrays for their values
  const firstVals: [string, any][] = Object.entries(first);
  const secondVals: [string, any][] = Object.entries(second);

  for (let i = 0; i < firstVals.length - 1; ++i) {
    const firstKey = firstVals[i][0];
    const secondKey = secondVals[i][0];
    const firstVal = firstVals[i][1];
    const secondVal = secondVals[i][1];

    // make sure that the values are different
    // and that we are not looking at attributes
    if (firstVal != secondVal && firstKey != "attributes") {
      changes.push(
        new MetadataChangeModifyMember(
          firstKey,
          firstVals[i][1],
          secondVals[i][1]
        )
      );
    }
  }

  return changes;
};

const compareMetadataAttributes = (
  first: readonly MetadataAttribute[],
  second: readonly MetadataAttribute[]
): MetadataChange[] => {
  const changes: MetadataChange[] = [];

  // construct a map of the second attribs
  let newAttribsMap = new Map<string, string>();
  second.forEach((attrib) => {
    newAttribsMap.set(attrib.trait_type, attrib.value);
  });

  // walk through all currentState attributes,
  // check if they still exist or have changed
  for (const firstAttrib of first) {
    const trait_type = firstAttrib.trait_type;
    const newAttribVal = newAttribsMap.get(trait_type);

    // if this attribute exists in the modified state, check if it changes
    if (newAttribVal !== undefined) {
      if (newAttribVal != firstAttrib.value) {
        changes.push(
          new MetadataChangeModifyAttribute(
            trait_type,
            firstAttrib.value,
            newAttribVal
          )
        );
      }

      newAttribsMap.delete(trait_type); // remove this attribute from the map
    }
    // this attribute does not exist anymore in the modified state
    else {
      changes.push(
        new MetadataChangeRemoveAttribute(
          firstAttrib.trait_type,
          firstAttrib.value
        )
      );
    }
  }

  // loop through all attributes that were not in the original state,
  // mark them as Attribute Additions
  newAttribsMap.forEach((value, key) => {
    changes.push(new MetadataChangeAddAttribute(key, value));
  });

  return changes;
};

export const compareMetadataGeneric = <FirstType, SecondType>(
  first: FirstType,
  second: SecondType
): MetadataChange[] => {
  if (!isMetadata(first)) {
    throw Error(
      `First argument does not fulfill the Metadata interface [${first}]`
    );
  } else if (!isMetadata(second)) {
    throw Error(
      `Second argument does not fulfill the Metadata interface [${second}]`
    );
  }

  const memberChanges = compareMetadataMembersGeneric(first, second);
  const attribChanges = compareMetadataAttributes(
    first.attributes,
    second.attributes
  );

  return memberChanges.concat(attribChanges);
};

export const compareMetadataMembersGeneric = <OldMetadataType, NewMetadataType>(
  first: OldMetadataType,
  second: NewMetadataType
): MetadataChange[] => {
  let changes: MetadataChange[] = [];

  const firstKeys = Object.entries(first);
  let secondMap = new Map<string, any>(Object.entries(second));

  for (const [key, value] of firstKeys) {
    if (key != "attributes") {
      const secondVal = secondMap.get(key);
      if (secondVal === undefined) {
        changes.push(new MetadataChangeRemoveMember(key, value));
      } else if (value != secondVal) {
        changes.push(new MetadataChangeModifyMember(key, value, secondVal));
      }
    }

    secondMap.delete(key);
  }

  secondMap.forEach((value, key) => {
    changes.push(new MetadataChangeAddMember(key, value));
  });

  return changes;
};
