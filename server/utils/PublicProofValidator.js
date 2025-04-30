const fs = require('fs');
const path = require('path');

/**
 * Validates that tagProofPublicJson matches with metaData and stored hashData and hashAlpha files
 * 
 * @param {Array} tagProofPublicJson - Array of 101 elements to validate
 * @param {Object} metaData - Object containing sigma array (first 50 elements)
 * @returns {Object} - Result object with success status and message
 */
function PublicProofValidator(tagProofPublicJson, metaData) {
  try {
    // Initialize result object
    const result = {
      success: false,
      message: '',
      errors: []
    };

    // Check if inputs have the expected structure
    if (!Array.isArray(tagProofPublicJson) || tagProofPublicJson.length !== 101) {
      result.errors.push('tagProofPublicJson must be an array of 101 elements');
      result.message = 'Invalid proof format';
      return result;
    }
    
    if (!metaData || !Array.isArray(metaData.sigma) || metaData.sigma.length !== 50) {
      result.errors.push('metaData must contain a sigma array of 50 elements');
      result.message = 'Invalid metadata format';
      return result;
    }
    
    // Extract the parts from tagProofPublicJson
    const tagProofSigma = tagProofPublicJson.slice(0, 50);
    const tagProofHashData = tagProofPublicJson.slice(50, 100);
    const tagProofHashAlpha = tagProofPublicJson[100];
    
    // Check if first 50 elements match sigma
    const sigmaMatch = tagProofSigma.every((value, index) => value === metaData.sigma[index]);
    if (!sigmaMatch) {
      result.errors.push('First 50 elements of tagProofPublicJson do not match metaData.sigma');
      result.message = 'Metadata verification failed';
      return result;
    }
    
    // Try to load hashData from file
    let hashData;
    try {
      const hashDataPath = path.join(__dirname, '../data/hashData.json');
      hashData = JSON.parse(fs.readFileSync(hashDataPath, 'utf8')).digest;
    } catch (error) {
      result.errors.push(`Could not load hashData file: ${error.message}`);
      result.message = 'User hasn\'t uploaded dataFile';
      return result;
    }
    
    // Check if hashData has expected structure
    if (!hashData || !Array.isArray(hashData.hashData) || hashData.hashData.length !== 50) {
      result.errors.push('hashData file must contain a hashData array of 50 elements');
      result.message = 'Invalid data file format';
      return result;
    }
    
    // Check if next 50 elements match hashData
    const hashDataMatch = tagProofHashData.every((value, index) => value === hashData.hashData[index]);
    if (!hashDataMatch) {
      result.errors.push('Elements 50-99 of tagProofPublicJson do not match hashData.hashData');
      result.message = 'Data hash verification failed';
      return result;
    }
    
    // Try to load hashAlpha from file
    let alphaHash;
    try {
      const alphaHashPath = path.join(__dirname, '../data/hashAlpha.json');
      alphaHash = JSON.parse(fs.readFileSync(alphaHashPath, 'utf8'));
    } catch (error) {
      result.errors.push(`Could not load alphaHash file: ${error.message}`);
      result.message = 'Provider hasn\'t uploaded certificate';
      return result;
    }
    
    // Check if alphaHash has expected structure
    if (!alphaHash || !alphaHash.hashAlpha) {
      result.errors.push('alphaHash file must contain a hashAlpha value');
      result.message = 'Invalid certificate format';
      return result;
    }
    
    // Check if the last element matches hashAlpha
    const hashAlphaMatch = tagProofHashAlpha === alphaHash.hashAlpha;
    if (!hashAlphaMatch) {
      result.errors.push('Element 100 of tagProofPublicJson does not match alphaHash.hashAlpha');
      result.message = 'Certificate verification failed';
      return result;
    }
    
    // All validations passed
    result.success = true;
    result.message = 'All validations passed successfully';
    return result;
  } catch (error) {
    return {
      success: false,
      message: 'Error during validation process',
      errors: [error.message]
    };
  }
}


module.exports = {PublicProofValidator};
