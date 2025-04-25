export default async function generateWitness(wasmBuffer, inputJson) {
  // Import the builder function from witness_calculator.js
  // We're assuming the file has been converted to ES module format
  // and is accessible in the same directory
  
  // Note: The provided witness_calculator.js was exported as a default function named 'builder'
  // We need to use that function to create a witness calculator
  
  try {
    // Dynamic import of the witness calculator
    const { default: builder } = await import('./witness_calculator.js');
    
    // Create a witness calculator from the WASM buffer
    const witnessCalculator = await builder(wasmBuffer);
    
    // Calculate the witness binary data
    const wtnsBuffer = await witnessCalculator.calculateWTNSBin(inputJson, 0);
    
    return wtnsBuffer;
  } catch (error) {
    console.error("Error in witness generation:", error);
    throw error;
  }
}
