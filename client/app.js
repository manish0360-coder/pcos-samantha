document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.getElementById("webcam");
    const statusElement = document.getElementById("status");
    const captureBtn = document.getElementById("capture-btn");
    const memoryBtn = document.getElementById("memory-btn");
    const summarizeBtn = document.getElementById("summarize-btn");
    const micBtn = document.getElementById("mic-btn");
    const captureCanvas = document.getElementById("capture-canvas");
    
    const socket = io();
    let autoCaptureTimer = null;
    
    socket.on("connect", () => {
        console.log("Perception Module: WebSocket bridge connected.");
    });

    socket.on("connect_error", (error) => {
        console.error("Perception Module: WebSocket connection failed.", error);
    });

    // Handle incoming configuration for autonomous perception loop
    socket.on("system_config", (config) => {
        console.log(`Perception Module: Received system config. Auto-capture interval: ${config.captureInterval}ms`);
        
        // Clear any existing timer to prevent overlapping loops
        if (autoCaptureTimer) clearInterval(autoCaptureTimer);
        
        // Start autonomous loop reusing the manual capture logic
        // Start autonomous perception loop.
        // Reuses the same capture pipeline as manual capture.
        autoCaptureTimer = setInterval(captureFrame, config.captureInterval);
    });

    // Handle raw memory response
    socket.on("recent_logs_response", (logs) => {
        console.log("Perception Module: Received recent memory logs.");
        console.table(logs);
    });

    // Handle reasoned summary response
    socket.on("memory_summary_response", (summary) => {
        console.log("================ SUMMARY ================");
        console.log(`Samantha: "${summary}"`);
        console.log("=========================================");
    });

    // Handle action audio response
    socket.on("memory_summary_audio", (base64Audio) => {
        console.log("Perception Module: Received audio payload. Playing speech...");

        const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);

        audio.play().catch((err) => {
            console.error("Client Error: Browser blocked audio playback.", err);
        });
    });

    async function initWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            videoElement.srcObject = stream;
            statusElement.textContent = "Status: Camera Connected (Autonomous)";
            statusElement.classList.remove("error");
            statusElement.classList.add("success");
        } catch (error) {
            statusElement.textContent = `Status: Camera Error - ${error.message}`;
            statusElement.classList.add("error");
        }
    }

    function captureFrame() {
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return;
        
        captureCanvas.width = videoElement.videoWidth;
        captureCanvas.height = videoElement.videoHeight;
        const context = captureCanvas.getContext("2d");
        context.drawImage(videoElement, 0, 0, captureCanvas.width, captureCanvas.height);
        
        if (socket.connected) {
            socket.emit("frame_capture", captureCanvas.toDataURL("image/jpeg"));
            console.log("Perception Module: Frame captured and emitted to backend.");
        }
    }

    function requestMemory() {
        if (socket.connected) socket.emit("request_recent_logs");
    }

    function requestSummary() {
        if (socket.connected) {
            console.log("Perception Module: Requesting memory summary...");
            socket.emit("request_memory_summary");
        }
    }

    // --- Speech Recognition (Ears) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false; // Listen for one command at a time
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            console.log("Perception Module: Microphone listening...");
            micBtn.textContent = "🔴 Listening...";
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log(`Perception Module: Heard -> "${transcript}"`);
            
            // Check for trigger words
            if (transcript.includes("summarize") || transcript.includes("day")) {
                console.log("Perception Module: Trigger word detected. Requesting summary.");
                requestSummary();
            }
        };
        
        recognition.onerror = (event) => {
            console.error("Perception Module: Microphone error:", event.error);
        };
        
        recognition.onend = () => {
            micBtn.textContent = "🎙️ Start Listening";
        };
    } else {
        console.warn("Perception Module: Speech Recognition API not supported in this browser.");
        micBtn.disabled = true;
        micBtn.title = "Browser not supported";
    }

    // Manual capture remains functional
    captureBtn.addEventListener("click", () => {
        console.log("Perception Module: Manual capture triggered.");
        captureFrame();
    });
    
    memoryBtn.addEventListener("click", requestMemory);
    summarizeBtn.addEventListener("click", requestSummary);

    if (recognition) {
        micBtn.addEventListener("click", () => recognition.start());
    }

    initWebcam();
});