const fs = require('fs');
const path = require('path');
const snarkjs = require('snarkjs');

/**
 * Verifies a zero-knowledge proof using Groth16 verification
 * @param {Object} tagProofJson - The proof JSON object
 * @param {Object} tagProofPublicJson - The public inputs JSON object
 * @returns {Promise<boolean>} - Whether the proof is valid
 */
async function verifyProof(tagProofJson, tagProofPublicJson) {
  try {
    // Load verification key from file
    const verificationKeyPath = path.join(__dirname, './verification_key.json');
    const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf8'));

    // This performs the same operation as "snarkjs groth16 verify"
    const isValid = await snarkjs.groth16.verify(
      verificationKey,
      tagProofPublicJson,
      tagProofJson
    );

    console.log(`Proof verification result: ${isValid}`);
    return isValid;
  } catch (error) {
    console.error('Error during proof verification:', error);
    throw error;
  }
}

module.exports = {verifyProof};