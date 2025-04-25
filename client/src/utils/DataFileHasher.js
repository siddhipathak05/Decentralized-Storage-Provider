const fs = require("fs");
const path = require("path");
const circomlib = require("circomlibjs");

async function CalculatePoseidonHashFromFile() {
    const dataFile = path.join(__dirname, "DataFile.json");
    const data = (JSON.parse(fs.readFileSync(dataFile))).Data;
    
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
    
	
    fs.writeFileSync("DataHash.json", JSON.stringify(outputData, null, 4));
    console.log("✅ DataHash.json written successfully.");
}

CalculatePoseidonHashFromFile().catch(console.error);

