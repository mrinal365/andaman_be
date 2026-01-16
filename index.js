const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'Andaman Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to Andaman API');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
