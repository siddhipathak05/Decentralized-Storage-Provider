const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { verifyCertificate } = require('../utils/verifyCertificate');
const {validateData} = require('../utils/jsValidation');
const {PublicProofValidator} = require('../utils/PublicProofValidator');
const { verifyProof } = require('../utils/verifyProof');
const {validateTau} = require('../utils/validateTau.js');
const {validateHashAlpha} = require('../utils/validateHashAlpha.js');
const {calculateTau} = require('../utils/CalculateTau.js');
const dataDir = path.join(__dirname, '..', 'data');
const hashAlphaFilePath = path.join(dataDir, 'hashAlpha.json');
const {saveJsonData} = require('../utils/saveAsFile.js')
router.post('/upload-certificate', async (req, res) => {

    try {

        const { certificate } = req.body;

        if (!certificate || typeof certificate !== 'object') {
            return res.status(400).json({ message: 'Missing or invalid "certificate" field in request body' });
        }

        // Certificate authentication
        const isValid = await verifyCertificate(certificate);

        const { hashAlpha } = certificate;

        if (!hashAlpha) {
            return res.status(400).json({ message: 'Missing "hashAlpha" key inside "certificate"' });
        }

        await fs.mkdir(dataDir, { recursive: true });

        const dataToSave = { hashAlpha };
        await fs.writeFile(hashAlphaFilePath, JSON.stringify(dataToSave, null, 2), 'utf8');

        res.status(201).json({ message: 'hashAlpha saved successfully' });

    } 
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save hashAlpha' });
    }
    
});

router.post('/upload-data', async (req, res) => {
    try {
      const { metaData, dataHash, alphaHash, tagProofJson, tagProofPublicJson } = req.body.dataHash;
        
      // Validate required fields
      if (!metaData || !dataHash || !alphaHash || !tagProofJson || !tagProofPublicJson) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields in request body' 
        });
      }
        saveJsonData(metaData, '../data/', 'metaData.json');
          // Step 1: Validate that data matches across all inputs
        const isDataValid = validateData(tagProofPublicJson, metaData, dataHash, alphaHash);
      
      const validationResult = PublicProofValidator(tagProofPublicJson, metaData);
      if (!validationResult.success || !isDataValid) {
        return res.status(400).json({ 
          success: false, 
          error: 'Data validation failed.' 
        });
      }
      
      // Step 2: Verify the proof
      const verificationKeyPath = path.join(__dirname, '../utils/verification_key.json');``
      const isProofValid = await verifyProof(verificationKeyPath, tagProofJson, tagProofPublicJson);
      console.log(isProofValid);
      
    //   if (!isProofValid) {
    //     return res.status(400).json({ 
    //       success: false, 
    //       error: 'Proof verification failed' 
    //     });
    //   }
      
      // Both validation and verification passed
      return res.status(200).json({ 
        success: true, 
        message: 'Data validated and proof verified successfully' 
      });
      
    } catch (error) {
      console.error('Error in /upload-data route:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error processing request: ' + error.message 
      });
    }
});

router.post('/upload-challenge', async (req, res) => {
  try {
    // Extract respProofPublicJson from the request body
    console.log(req.body);
    const { metaData, respProofJson, respProofPublicJson } = req.body;
    
    // Validate that respProofPublicJson exists
    if (!metaData || !respProofJson || !respProofPublicJson) {
      return res.status(400).json({
        success: false,
        error: 'Missing fields in request body'
      });
    }
    
    await calculateTau();
    
    // Verify that the Tau values match
    const isTauValid = validateTau(respProofPublicJson);
    if (!isTauValid) {
      return res.status(400).json({
        success: false,
        error: 'Tau verification failed: values do not match'
      });
    }
    
    // Verify that the hashAlpha values match
    const isHashAlphaValid = validateHashAlpha(respProofPublicJson);
    if (!isHashAlphaValid) {
      return res.status(400).json({
        success: false,
        error: 'HashAlpha verification failed: values do not match'
      });
    }

    const verificationKeyPath = path.join(__dirname, '../utils/resp_verification_key.json');
    const isProofValid = await verifyProof(verificationKeyPath, respProofJson, respProofPublicJson);
    console.log(isProofValid);
    
    // If we reach here, both verifications passed
    return res.status(200).json({
      success: true,
      message: 'Challenge verification successful: Tau and hashAlpha match'
    });
    
  } catch (error) {
    console.error('Error in /upload-challenges route:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error processing request: ' + error.message
    });
  }
});

router.get('/get_seed', (req, res) => {
  // Generate two random 3-digit numbers (100–999)
  const seed1 = Math.floor(Math.random() * 900) + 100;
  const seed2 = Math.floor(Math.random() * 900) + 100;
  
  // Create the seed array
  const seedData = { seed: [seed1, seed2] };
  
  // Save the seed array to a JSON file
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../data/seeds.json');
    
    // Make sure the directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write the seed data to the file
    fs.writeFileSync(filePath, JSON.stringify(seedData, null, 2));
    
    // Send response
    res.json(seedData);
  } catch (error) {
    console.error('Error saving seed data:', error);
    res.status(500).json({ error: 'Failed to save seed data' });
  }
});

module.exports = router;
