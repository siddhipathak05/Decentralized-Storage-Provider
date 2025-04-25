/**
 * Validates that the tagProofPublicJson data matches the corresponding parts in
 * metaData, dataHash, and alphaHash
 * 
 * @param {Array} tagProofPublicJson - Array of 101 elements to validate
 * @param {Object} metaData - Object containing sigma array (first 50 elements)
 * @param {Object} dataHash - Object containing hashData array (next 50 elements)
 * @param {Object} alphaHash - Object containing hashAlpha value (last element)
 * @returns {boolean} - Whether all data matches
 */
function validateData(tagProofPublicJson, metaData, dataHash, alphaHash) {
  try {
    // Check if inputs have the expected structure
    if (!Array.isArray(tagProofPublicJson) || tagProofPublicJson.length !== 101) {
      console.error('tagProofPublicJson must be an array of 101 elements');
      return false;
    }
    
    if (!metaData || !Array.isArray(metaData.sigma) || metaData.sigma.length !== 50) {
      console.error('metaData must contain a sigma array of 50 elements');
      return false;
    }
    
    if (!dataHash || !Array.isArray(dataHash.hashData) || dataHash.hashData.length !== 50) {
      console.error('dataHash must contain a hashData array of 50 elements');
      return false;
    }
    
    if (!alphaHash || !alphaHash.hashAlpha) {
      console.error('alphaHash must contain a hashAlpha value');
      return false;
    }
    
    // Extract the parts from tagProofPublicJson
    const tagProofSigma = tagProofPublicJson.slice(0, 50);
    const tagProofHashData = tagProofPublicJson.slice(50, 100);
    const tagProofHashAlpha = tagProofPublicJson[100];
    
    // Check if first 50 elements match sigma
    const sigmaMatch = tagProofSigma.every((value, index) => value === metaData.sigma[index]);
    if (!sigmaMatch) {
      console.error('First 50 elements of tagProofPublicJson do not match metaData.sigma');
      return false;
    }
    
    // Check if next 50 elements match hashData
    const hashDataMatch = tagProofHashData.every((value, index) => value === dataHash.hashData[index]);
    if (!hashDataMatch) {
      console.error('Elements 50-99 of tagProofPublicJson do not match dataHash.hashData');
      return false;
    }
    
    // Check if the last element matches hashAlpha
    const hashAlphaMatch = tagProofHashAlpha === alphaHash.hashAlpha;
    if (!hashAlphaMatch) {
      console.error('Element 100 of tagProofPublicJson does not match alphaHash.hashAlpha');
      return false;
    }
    
    // All validations passed
    return true;
  } catch (error) {
    console.error('Error during data validation:', error);
    return false;
  }
}

module.exports = {validateData};