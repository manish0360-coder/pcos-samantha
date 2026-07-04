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
const { generateSpeech } = require("./action/tts");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend
app.use(express.static(path.join(__dirname, "../client")));

// Configuration
let captureInterval = parseInt(process.env.CAPTURE_INTERVAL_MS, 10);
if (isNaN(captureInterval) || captureInterval <= 0) {
    captureInterval = 60000; // Fallback to 60 seconds
}

// System State (Infrastructure Memory)
let lastObservation = "";
let apiCooldownUntil = 0; // Epoch timestamp for Quota Backoff

/**
 * Parses API errors and engages global cooldown if quota is exceeded.
 */
function handleApiError(error) {
    if (error.message.includes("429") || error.status === 429 || error.message.toLowerCase().includes("quota")) {
        // Attempt to parse Google's exact retry instruction, default to 60s
        const delayMatch = error.message.match(/Retry in (\d+) seconds/i);
        const cooldownMs = delayMatch ? parseInt(delayMatch[1], 10) * 1000 : 60000;
        
        apiCooldownUntil = Date.now() + cooldownMs;
        console.warn(`Infrastructure: API Quota exceeded. Cooldown engaged for ${cooldownMs / 1000}s.`);
    }
}

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("Infrastructure: Client connected", socket.id);

    // Send configuration to client
    socket.emit("system_config", { captureInterval });
    console.log(`Infrastructure: Sent system_config (Interval: ${captureInterval}ms) to client.`);

    // [Perception -> Observation -> Memory] Pipeline
    socket.on("frame_capture", async (base64Image) => {
        // 1. Check Infrastructure Cooldown
        if (Date.now() < apiCooldownUntil) {
            console.log("Infrastructure: Quota backoff active. Dropping frame.");
            return;
        }

        console.log("Infrastructure: Received frame_capture event.");
        let description;
        
        // 2. Perception execution
        try {
            console.log("Perception: Analyzing frame via Gemini Vision...");
            description = await describeImage(base64Image);
        } catch (error) {
            handleApiError(error);
            return; // Abort pipeline: DO NOT save errors to memory
        }

        console.log(`Perception: Vision Output -> "${description}"`);

        // 3. Observation Filter
        const decision = evaluateObservation(lastObservation, description);
        if (decision === "SKIP") {
            console.log("Observation: State unchanged. Skipping memory storage.");
            return;
        }

        // 4. Memory Persistence
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
        // 1. Check Infrastructure Cooldown
        if (Date.now() < apiCooldownUntil) {
            console.log("Infrastructure: Quota backoff active. Rejecting summary request.");
            socket.emit("memory_summary_response", "I am taking a brief operational pause due to rate limits. Please try again shortly.");
            return;
        }

        console.log("Infrastructure: Received request_memory_summary event.");
        
        // 2. Execution
        try {
            const logs = await getRecentLogs(20);
            const summary = await generateSummary(logs);
            socket.emit("memory_summary_response", summary);
            console.log("Infrastructure: Emitted memory_summary_response to client.");

            // [Reasoning -> Action] Pipeline
            try {
                console.log("Action: Generating speech for summary...");
                const audioBase64 = await generateSpeech(summary);
                socket.emit("memory_summary_audio", audioBase64);
                console.log("Infrastructure: Emitted memory_summary_audio to client.");
            } catch (ttsError) {
                console.warn("Infrastructure: Action (TTS) skipped. Reason:", ttsError.message);
            }
        } catch (error) {
            handleApiError(error);
            socket.emit("memory_summary_response", "I encountered an operational delay. Please try again later.");
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