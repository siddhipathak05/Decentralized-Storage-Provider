const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const authDataPath = path.join(__dirname, '..', 'authentication_data.json');
const authData = JSON.parse(fs.readFileSync(authDataPath, 'utf8'));

const JWT_SECRET = 'randomStringAsAKey';

router.post('/login', (req, res) => {

    const { username, password } = req.body;
    const user = authData.find(u => u.username === username && u.password === password);

    if (user) {
        const token = jwt.sign(
            { username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
    res.json({ message: 'Login successful', token, user:{role: user.role }});
    } 
    else {
        res.status(401).json({ message: 'Invalid credentials' });
    }

});

module.exports = router;
