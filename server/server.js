require("dotenv").config(); // Load environment variables

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Import Modules
const { describeImage } = require("./perception/vision_describe");
const { saveLog } = require("./memory/store");
const { getRecentLogs } = require("./memory/retrieve");
const { generateSummary } = require("./reasoning/summarize");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend
app.use(express.static(path.join(__dirname, "../client")));

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("Infrastructure: Client connected", socket.id);

    // [Perception -> Memory] Pipeline
    socket.on("frame_capture", async (base64Image) => {
        console.log("Infrastructure: Received frame_capture event.");
        console.log("Perception: Analyzing frame via Gemini Vision...");
        
        const description = await describeImage(base64Image);
        console.log(`Perception: Vision Output -> "${description}"`);

        try {
            await saveLog(description);
        } catch (error) {
            console.error("Infrastructure Error: Failed to route to memory.", error.message);
        }
    });

    // [Memory Retrieval - Raw]
    socket.on("request_recent_logs", async () => {
        console.log("Infrastructure: Received request_recent_logs event.");
        try {
            const logs = await getRecentLogs(20);
            socket.emit("recent_logs_response", logs);
        } catch (error) {
            console.error("Infrastructure Error: Failed to retrieve logs.", error.message);
        }
    });

    // [Memory -> Reasoning] Pipeline
    socket.on("request_memory_summary", async () => {
        console.log("Infrastructure: Received request_memory_summary event.");
        try {
            const logs = await getRecentLogs(20);
            const summary = await generateSummary(logs);
            socket.emit("memory_summary_response", summary);
            console.log("Infrastructure: Emitted memory_summary_response to client.");
        } catch (error) {
            console.error("Infrastructure Error: Failed to generate/route summary.", error.message);
        }
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