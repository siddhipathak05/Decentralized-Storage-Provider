import * as circomlib from "circomlibjs";

export default async function tagGenerator(alphaJson, dataJson) {
    const alpha = alphaJson.alpha;
    const data = dataJson.Data;

    // Detailed error checking
    if (!Array.isArray(data)) {
        throw new Error("❌ 'Data' is not an array.");
    }
    if (data.length !== 50) {
        throw new Error(`❌ 'Data' must have 50 rows. Found: ${data.length}`);
    }
    for (let i = 0; i < data.length; i++) {
        if (!Array.isArray(data[i]) || data[i].length !== 10) {
            throw new Error(`❌ Row ${i} must have 10 elements. Found: ${data[i].length}`);
        }
    }

    const babyjub = await circomlib.buildBabyjub();
    const F = babyjub.F;

    const sigma = [];

    for (let i = 0; i < 50; i++) {
        let result = F.zero;
        let power = F.e(alpha);

        for (let j = 0; j < 10; j++) {
            const coeff = F.e(data[i][j]);
            const term = F.mul(coeff, power);
            result = F.add(result, term);
            power = F.mul(power, F.e(alpha));
        }

        sigma.push(F.toString(result));
    }

    return { sigma };
}
