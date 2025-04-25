import * as circomlib from "circomlibjs";

export default async function alphaHasher(parsedJson) {
    const alpha = parsedJson.alpha;

    const poseidon = await circomlib.buildPoseidon();
    const babyjub = await circomlib.buildBabyjub();
    const F = babyjub.F;

    const hashAlpha = poseidon.F.toString(poseidon([alpha]));

    return {
        hashAlpha
    };
}
