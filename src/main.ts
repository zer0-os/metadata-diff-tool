import { compareMetadata } from "./compareMetadata";
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

const newData: Metadata = {
  animation_url: "",
  attributes: [
    { trait_type: "testAdd", value: "hello" },
    { trait_type: "testModify", value: "modified" },
  ],
  image: "image",
  description: "desc",
  image_full: "img_full",
  name: "name",
};

const main = () => {
  console.log("main");

  const diff = compareMetadata(oldData, newData);
  console.log(diff);
};

main();
