document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.getElementById("webcam");
    const statusElement = document.getElementById("status");
    const captureBtn = document.getElementById("capture-btn");
    const captureCanvas = document.getElementById("capture-canvas");

    /**
     * Initializes the webcam by requesting user permission and attaching
     * the media stream to the HTML video element.
     */
    async function initWebcam() {
        try {
            // Request video stream from the browser's MediaDevices API
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: false // Audio is not required for the vision pipeline
            });

            // Attach the hardware stream to the DOM element
            videoElement.srcObject = stream;

            // Update UI state
            statusElement.textContent = "Status: Camera Connected";
            statusElement.classList.remove("error");
            statusElement.classList.add("success");
            
            console.log("Perception Module: Camera successfully initialized.");

        } catch (error) {
            // Handle permission denials or hardware missing
            statusElement.textContent = `Status: Camera Error - ${error.message}`;
            statusElement.classList.add("error");
            
            console.error("Perception Module Error: Could not access camera.", error);
        }
    }

    /**
     * Captures the current frame from the live video element, draws it 
     * into the hidden 2D canvas buffer, and encodes it to a Base64 string.
     */
    function captureFrame() {
        // Ensure the video stream is active and dimensions are available
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            console.warn("Perception Module: Video stream not ready yet.");
            return;
        }

        // Sync canvas resolution with the actual hardware stream resolution
        captureCanvas.width = videoElement.videoWidth;
        captureCanvas.height = videoElement.videoHeight;

        // Extract the frame by drawing the video element onto the canvas context
        const context = captureCanvas.getContext("2d");
        context.drawImage(videoElement, 0, 0, captureCanvas.width, captureCanvas.height);

        // Serialize the captured canvas into a Base64 JPEG string.
        // This prepares the image for future transmission to the backend.
        const base64Image = captureCanvas.toDataURL("image/jpeg");

        // Verification output.
        // We only confirm generation at this milestone.
        // Transmission will be implemented later.
        console.log("Base64 generated successfully.");
        console.log("Base64 string length:", base64Image.length);
    }

    // Attach event listeners
    captureBtn.addEventListener("click", captureFrame);

    // Start the perception initialization
    initWebcam();
});