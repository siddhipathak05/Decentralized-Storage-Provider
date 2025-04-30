function validateHashAlpha(respProofPublicJson) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Load the hashAlpha from file
    const hashAlphaPath = path.join(__dirname, '../data/hashAlpha.json');
    const hashAlphaData = JSON.parse(fs.readFileSync(hashAlphaPath, 'utf8'));
    
    // Get stored hashAlpha value
    const storedHashAlpha = hashAlphaData.hashAlpha;
    
    // Get hashAlpha from respProofPublicJson (12th element)
    const submittedHashAlpha = respProofPublicJson[11]; // 12th element (0-indexed)
    
    // Compare the values
    return storedHashAlpha === submittedHashAlpha;
  } catch (error) {
    console.error('Error verifying hashAlpha:', error);
    return false;
  }
}

module.exports = {validateHashAlpha};
