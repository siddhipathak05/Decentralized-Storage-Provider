import * as circomlib from "circomlibjs";

export async function browserPoseidonHasher(inputJson) {

  const data = inputJson.Data;

  if (!Array.isArray(data) || data.length !== 50 || data[0].length !== 10) {
    throw new Error("Input block must be a 50x10 array.");
  }

  const poseidon = await circomlib.buildPoseidon();
  const babyjub = await circomlib.buildBabyjub();
  const F = babyjub.F;
  const hashData = [];

  for (let i = 0; i < data.length; i++) {
      const block = data[i].map(x => BigInt(x));

      // Poseidon hash of this block
      const hash = poseidon.F.toString(poseidon(block));
      hashData.push(hash);
  }
      
  const outputData = {
      hashData: hashData
  };

  return outputData;

}
