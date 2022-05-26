import {
  combineMetadatas,
  Metadata,
  MetadataAttribute,
  MetadataDiff,
  MetadataChangeModifyMember,
  MetadataChangeRemoveAttribute,
  MetadataChangeModifyAttribute,
  MetadataChangeAddAttribute,
  MetadataChange,
} from "./types";

export const compareMetadata = (
  first: Metadata,
  second: Metadata
): MetadataChange[] => {
  const valueDiff = compareMetadataValues(first, second);
  const attributesDiff = compareMetadataAttributes(
    first.attributes,
    second.attributes
  );

  return valueDiff.concat(attributesDiff);
};

const compareMetadataValues = (
  first: Metadata,
  second: Metadata
): MetadataChange[] => {
  const diff: MetadataChange[] = [];

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
      diff.push(
        new MetadataChangeModifyMember(
          firstKey,
          firstVals[i][1],
          secondVals[i][1]
        )
      );
    }
  }

  return diff;
};

const compareMetadataAttributes = (
  first: readonly MetadataAttribute[],
  second: readonly MetadataAttribute[]
): MetadataChange[] => {
  const diff: MetadataChange[] = [];

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
        diff.push(
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
      diff.push(
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
    diff.push(new MetadataChangeAddAttribute(key, value));
  });

  return diff;
};
