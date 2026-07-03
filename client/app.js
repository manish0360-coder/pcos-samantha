document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.getElementById("webcam");
    const statusElement = document.getElementById("status");
    const captureBtn = document.getElementById("capture-btn");
    const memoryBtn = document.getElementById("memory-btn");
    const captureCanvas = document.getElementById("capture-canvas");
    
    // Initialize WebSocket connection to the backend
    const socket = io();
    
    socket.on("connect", () => {
        console.log("Perception Module: WebSocket bridge connected.");
    });

    socket.on("connect_error", (error) => {
        console.error("Perception Module: WebSocket connection failed.", error);
    });

    /**
     * Listen for memory retrieval responses from the backend
     */
    socket.on("recent_logs_response", (logs) => {
        console.log("Perception Module: Received recent memory logs.");
        // Render directly to console table as required
        console.table(logs);
    });

    /**
     * Initializes the webcam by requesting user permission and attaching
     * the media stream to the HTML video element.
     */
    async function initWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: false 
            });

            videoElement.srcObject = stream;

            statusElement.textContent = "Status: Camera Connected";
            statusElement.classList.remove("error");
            statusElement.classList.add("success");
            
            console.log("Perception Module: Camera successfully initialized.");

        } catch (error) {
            statusElement.textContent = `Status: Camera Error - ${error.message}`;
            statusElement.classList.add("error");
            console.error("Perception Module Error: Could not access camera.", error);
        }
    }

    /**
     * Captures the current frame from the live video element, draws it 
     * into the hidden 2D canvas buffer, encodes it to a Base64 string,
     * and transmits it to the backend via WebSocket.
     */
    function captureFrame() {
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            console.warn("Perception Module: Video stream not ready yet.");
            return;
        }

        captureCanvas.width = videoElement.videoWidth;
        captureCanvas.height = videoElement.videoHeight;

        const context = captureCanvas.getContext("2d");
        context.drawImage(videoElement, 0, 0, captureCanvas.width, captureCanvas.height);

        const base64Image = captureCanvas.toDataURL("image/jpeg");

        console.log("Base64 generated successfully.");
        console.log("Base64 string length:", base64Image.length);

        // Transmit to backend if socket is connected
        if (socket.connected) {
            socket.emit("frame_capture", base64Image);
            console.log("Base64 sent to backend via WebSocket.");
        } else {
            console.warn("Perception Module: Cannot send frame. WebSocket disconnected.");
        }
    }

    /**
     * Requests recent memory logs from the backend via WebSocket.
     */
    function requestMemory() {
        if (socket.connected) {
            socket.emit("request_recent_logs");
            console.log("Perception Module: Requested recent memory logs.");
        } else {
            console.warn("Perception Module: Cannot request memory. WebSocket disconnected.");
        }
    }

    // Attach event listeners
    captureBtn.addEventListener("click", captureFrame);
    memoryBtn.addEventListener("click", requestMemory);

    // Start the perception initialization
    initWebcam();
});