const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'Andaman Backend is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
