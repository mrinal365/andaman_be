require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initCronJobs } = require("./cron");

const http = require("http");
const { Server } = require("socket.io");

// 🔥 SOCKET CHANGE: import socket initializer
const initSocket = require("./socket/socket");

// creatig api server
const app = express();

// 🔥 SOCKET CHANGE: create HTTP server
const server = http.createServer(app);

const port = process.env.PORT || 5000;

// 🔥 SOCKET CHANGE: initialize socket on same server
const io = new Server(server, {
    cors: {
        origin: '*', // ⚠️ restrict in production
    }
});

// 🔥 SOCKET CHANGE: attach io to req (for controllers)
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Enable CORS 
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Connect DB
connectDB();

// Body parser
app.use(express.json());

// Routes
app.use('/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/message', require('./routes/messageRoutes'));

// Feed Routes
app.use("/api", require("./routes/feedRoutes"));
app.use("/api", require("./routes/interactionRoutes"));
app.use("/api", require("./routes/postRoutes"));
app.use("/api", require("./routes/commentRoutes"));
app.use("/api", require("./routes/viewRoutes"));
app.use("/api", require("./routes/storyRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Upload routes
app.use("/api", require("./routes/uploadRoutes"));

// Weather routes
app.use("/api", require("./routes/weatherRoutes"));

// Notification routes
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.get('/', (req, res) => {
    res.send('Andaman API is running!');
});

// 🔥 SOCKET CHANGE: initialize socket logic (moved to separate file)
initSocket(io);

//Initiate CRon JObs here
// start cron jobs
initCronJobs()

// 🔥 SOCKET CHANGE: use server.listen instead of app.listen
server.listen(port, '::', () => {
    console.log(`Server is listening at http://localhost:${port}`);
});













































































// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const http = require("http");
// const { Server } = require("socket.io");

// // servers
// const app = express();
// const server = http.createServer(app);

// const port = process.env.PORT || 5000;

// // Enable CORS for all origins
// app.use(cors({
//     origin: '*',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     preflightContinue: false,
//     optionsSuccessStatus: 204
// }));

// // Connect to Database
// connectDB();

// // Body parser
// app.use(express.json());

// // Routes
// app.use('/health', require('./routes/health'));
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/chat', require('./routes/chatRoutes'));
// app.use('/api/message', require('./routes/messageRoutes'));

// //Feed Routes
// app.use("/api", require("./routes/feedRoutes"));
// app.use("/api", require("./routes/interactionRoutes"));
// app.use("/api", require("./routes/postRoutes"));
// app.use("/api", require("./routes/commentRoutes"));
// app.use("/api", require("./routes/viewRoutes"));

// // upload routes
// app.use("/api", require("./routes/uploadImages"));


// app.get('/', (req, res) => {
//     res.send('Andaman API is running!');
// });

// app.listen(port, '::', () => {
//     console.log(`Server is listening at http://localhost:${port}`);
// });
