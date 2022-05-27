import { compareMetadata, compareMetadataGeneric } from "./compareMetadata";
import { Metadata } from "./types";

const oldData: Metadata = {
  animation_url: "",
  attributes: [
    { trait_type: "testModify", value: "original" },
    { trait_type: "testRemove", value: "goodbye" },
  ],
  image: "",
  description: "",
  image_full: "",
  name: "",
};

const newData = {
  animation_url: "",
  attributes: [
    { trait_type: "testAdd", value: "hello" },
    { trait_type: "testModify", value: "modified" },
  ],
  image: "image",
  description: "desc",
  image_full: "img_full",
  name: "name",
  newMember: "newboi",
};

const main = () => {
  console.log("main");

  const diff = compareMetadata(oldData, newData);
  const diffGeneric = compareMetadataGeneric(oldData, newData);
  console.log(diff);
  console.log(diffGeneric);
};

main();
