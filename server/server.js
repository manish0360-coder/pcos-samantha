const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server);

// Serve the frontend static files from the /client directory
app.use(express.static(path.join(__dirname, "../client")));

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("Infrastructure: Client connected", socket.id);

    // Listen for incoming frames from the perception module
    socket.on("frame_capture", (base64Image) => {
        console.log("Infrastructure: Received frame_capture event.");
        console.log(`Payload size: ${base64Image.length} characters.`);
    });

    socket.on("disconnect", () => {
        console.log("Infrastructure: Client disconnected", socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`PCOS Orchestrator running on http://localhost:${PORT}`);
});