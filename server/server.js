require("dotenv").config(); // Load environment variables

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Import Modules
const { describeImage } = require("./perception/vision_describe");
const { evaluateObservation } = require("./observation/filter");
const { saveLog } = require("./memory/store");
const { getRecentLogs } = require("./memory/retrieve");
const { generateSummary } = require("./reasoning/summarize");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend
app.use(express.static(path.join(__dirname, "../client")));

// Read configuration
let captureInterval = parseInt(process.env.CAPTURE_INTERVAL_MS, 10);
if (isNaN(captureInterval) || captureInterval <= 0) {
    captureInterval = 60000; // Fallback to 60 seconds
}

// State (RAM)
let lastObservation = "";

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("Infrastructure: Client connected", socket.id);

    // Send configuration to client
    socket.emit("system_config", { captureInterval });
    console.log(`Infrastructure: Sent system_config (Interval: ${captureInterval}ms) to client.`);

    // [Perception -> Observation -> Memory] Pipeline
    socket.on("frame_capture", async (base64Image) => {
        console.log("Infrastructure: Received frame_capture event.");
        console.log("Perception: Analyzing frame via Gemini Vision...");
        
        const description = await describeImage(base64Image);
        console.log(`Perception: Vision Output -> "${description}"`);

        // Handle Vision Errors
        if (!description || description === "Error analyzing frame.") {
            console.log("Infrastructure: Vision observation skipped (Error).");
            return; 
        }

        // Observation Layer: Filter duplicates
        const decision = evaluateObservation(lastObservation, description);
        
        if (decision === "SKIP") {
            console.log("Observation: State unchanged. Skipping memory storage.");
            return;
        }

        // Memory Layer: Persist novel observations
        try {
            await saveLog(description);
            lastObservation = description; // Update state in RAM
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