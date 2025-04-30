function validateTau(respProofPublicJson) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Load the calculated Tau from file
    const calculatedTauPath = path.join(__dirname, '../data/CalculatedTau.json');
    const calculatedTauData = JSON.parse(fs.readFileSync(calculatedTauPath, 'utf8'));
    
    // Get stored Tau value
    const storedTau = calculatedTauData.Tau;
    console.log(storedTau)
    
    // Get Tau from respProofPublicJson (11th element)
    const submittedTau = respProofPublicJson[10]; // 11th element (0-indexed)
    console.log(submittedTau)

    // Compare the values
    return storedTau == submittedTau;
  } catch (error) {
    console.error('Error verifying Tau value:', error);
    return false;
  }
}

module.exports = {validateTau};
