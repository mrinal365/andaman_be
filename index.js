require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Connect to Database
connectDB();

// Body parser
app.use(express.json());

// Routes
app.use('/health', require('./routes/health'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/chat', require('./routes/chatRoutes'));
app.use('/api/v1/message', require('./routes/messageRoutes'));

app.get('/', (req, res) => {
    res.send('Andaman API is running!');
});

app.listen(port, '::', () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
