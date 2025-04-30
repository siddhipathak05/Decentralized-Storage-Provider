const fs = require("fs");
const path = require("path");

// --- Seeded Random Generator ---
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

// --- Parameters ---
const No_Of_Rows = 50;        // Total no. of rows in the metadata
const CHALLENGE_SIZE = 5;     // Total no. of challenged blocks
const Coeff_Domain = 100;     // Max value of a sector coefficient

async function calculateTau(metaDataJson) {
    // --- Load Seeds File ---
    const seedsFile = path.join(__dirname, "../data/seeds.json");
    const seeds = JSON.parse(fs.readFileSync(seedsFile)).seed;
    const seed1 = seeds[0];
    const seed2 = seeds[1];

    // --- Step 1: Generate indices and coefficients ---
    const index = generateRandomIntArray(seed1, CHALLENGE_SIZE, No_Of_Rows);
    const coeff = generateRandomIntArray(seed2, CHALLENGE_SIZE, Coeff_Domain);

    // --- Step 2: Compute Tau ---
    let Tau = 0;
    for (let i = 0; i < CHALLENGE_SIZE; i++) {
        Tau += metaDataJson.sigma[index[i]] * coeff[i];
    }

    // --- Step 3: Write to ../data/CalculatedTau.json ---
    const output = { Tau };
    const outputPath = path.join(__dirname, "../data/CalculatedTau.json");
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log("✅ Output written to ../data/CalculatedTau.json");
}

module.exports = {calculateTau};
