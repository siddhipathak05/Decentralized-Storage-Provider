//export default function Merger(
//  dataFileJson,
//  alphaJson,
//  metaDataJson,
//  alphaHashJson,
//  dataHashJson
//) {
//  const merged = {
//    ...dataFileJson,
//    ...alphaJson,
//    ...metaDataJson,
//    ...alphaHashJson,
//    ...dataHashJson,
//  };
//
//  return merged;
//}
export default function Merger(...jsonObjects) {
  return Object.assign({}, ...jsonObjects);
}

