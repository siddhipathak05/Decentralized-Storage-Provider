import * as snarkjs from 'snarkjs';

/**
 * Generates a ZK proof using Groth16 protocol
 * 
 * @param {ArrayBuffer} zkeyBuffer - The circuit_final.zkey file as ArrayBuffer
 * @param {Uint8Array} wtnsBuffer - The witness buffer generated previously
 * @returns {Promise<{proof: Object, publicSignals: Array}>} - Returns the proof and public signals
 */
export async function generateProof(zkeyBuffer, wtnsBuffer) {
  try {
    // Convert ArrayBuffer to proper format if needed
    const zkey = new Uint8Array(zkeyBuffer);
    
    // Generate the proof using snarkjs
    const { proof, publicSignals } = await snarkjs.groth16.prove(
      zkey,      // zkey file data
      wtnsBuffer // witness data
    );
    
    // Format outputs similar to what "snarkjs groth16 prove" would generate
    const tagProofJson = {
      pi_a: proof.pi_a,
      pi_b: proof.pi_b,
      pi_c: proof.pi_c,
      protocol: "groth16",
      "curve": "bn128"
    };
    
    const tagProofPublicJson = publicSignals;
    
    return {
      tagProofJson,
      tagProofPublicJson
    };
  } catch (error) {
    console.error("Error generating proof:", error);
    throw error;
  }
}

/**
 * Alternative implementation using the snarkjs CLI API pattern
 * This is closer to how the snarkjs CLI would work
 */
export async function generateProofUsingCliApi(zkeyBuffer, wtnsBuffer) {
  try {
    // Create temporary objects to simulate file data
    const zkeyData = new Uint8Array(zkeyBuffer);
    
    // Use the snarkjs full prover API
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      { type: "mem", data: wtnsBuffer }, // witness data as memory object
      { type: "mem", data: zkeyData },   // zkey data as memory object
      undefined                          // no phase 2 contributions needed
    );
    
    // Format as standard output files
    const tagProofJson = {
      pi_a: proof.pi_a,
      pi_b: proof.pi_b,
      pi_c: proof.pi_c,
      protocol: "groth16",
      "curve": "bn128"
    };
    
    const tagProofPublicJson = publicSignals;
    
    return {
      tagProofJson,
      tagProofPublicJson
    };
  } catch (error) {
    console.error("Error generating proof with CLI API:", error);
    throw error;
  }
}