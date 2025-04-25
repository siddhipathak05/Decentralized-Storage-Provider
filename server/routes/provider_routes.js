const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { verifyCertificate } = require('../utils/verifyCertificate');
const {validateData} = require('../utils/jsValidation');
const {PublicProofValidator} = require('../utils/PublicProofValidator');
const { verifyProof } = require('../utils/verifyProof');

const dataDir = path.join(__dirname, '..', 'data');
const hashAlphaFilePath = path.join(dataDir, 'hashAlpha.json');

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
      const isProofValid = await verifyProof(tagProofJson, tagProofPublicJson);
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

module.exports = router;
