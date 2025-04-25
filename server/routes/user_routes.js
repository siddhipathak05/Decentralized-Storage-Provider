const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dataFilePath = path.join(dataDir, 'hashData.json');

router.post('/upload-data', async (req, res) => {

    try {

        const { userData } = req.body;

        if (!userData) {
            return res.status(400).json({ message: 'Missing "userData" field in request body' });
        }

        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(dataFilePath, JSON.stringify(userData, null, 2), 'utf8');
        res.status(201).json({ message: 'User data saved successfully' });
        
    } 
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save user data' });
    }

});

module.exports = router;
