function seededRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function generateRandomIntArray(seed, size, max) {
    let arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(seededRandom(seed + i) * max));
    }
    return arr;
}

/**
 * Generate Miu and Tau from data, metadata, and seeds.
 * 
 * @param {number[][]} dataJson - 2D array of data blocks (each block is an array of sectors)
 * @param {number[]} metaData - Array of tag values (one per block)
 * @param {number[]} seedArray - Array with two seeds: [seed1, seed2]
 * @returns {{ Miu: number[], Tau: number }} - Output object
 */
export default function generateResponse(dataJson, metaData, seedArray) {
    // --- Configuration ---
    const No_Of_Rows = 50;
    const CHALLENGE_SIZE = 5;
    const BLOCK_SIZE = 10;
    const Coeff_Domain = 100;

    const seed1 = seedArray[0];
    const seed2 = seedArray[1];

    // Step 1: Generate index[i] and coeff[i]
    const index = generateRandomIntArray(seed1, CHALLENGE_SIZE, No_Of_Rows);
    const coeff = generateRandomIntArray(seed2, CHALLENGE_SIZE, Coeff_Domain);

    // Step 2: Compute Miu
    let MiuBlock = Array(BLOCK_SIZE).fill(0);
    for (let i = 0; i < CHALLENGE_SIZE; i++) {
        const sectors = dataJson.Data[index[i]];
        for (let j = 0; j < BLOCK_SIZE; j++) {
            MiuBlock[j] += sectors[j] * coeff[i];
        }
    }

    // Step 3: Compute Tau
    let Tau = 0;
    for (let i = 0; i < CHALLENGE_SIZE; i++) {
        Tau += metaData.sigma[index[i]] * coeff[i];
    }

    return {
        Miu: MiuBlock,
        Tau: Tau
    };
}
