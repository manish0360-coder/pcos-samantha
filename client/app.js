/**
 * ============================================================================
 * PCOS - Samantha
 * Module: Perception
 * File: app.js
 *
 * Responsibility:
 * Initializes the browser webcam and streams live video to the UI.
 *
 * This module DOES NOT:
 * - capture images
 * - communicate with the backend
 * - call AI models
 * - store data
 * - perform image processing
 *
 * Those responsibilities belong to future milestones.
 * ============================================================================
 */


document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.getElementById("webcam");
    const statusElement = document.getElementById("status");

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
        // ============================================================================
        // Error Handling
        // Display a user-friendly error if camera initialization fails.
        // ============================================================================
        } catch (error) {
            // Handle permission denials or hardware missing
            statusElement.textContent = `Status: Camera Error - ${error.message}`;
            statusElement.classList.add("error");
            
            console.error("Perception Module Error: Could not access camera.", error);
        }
    }

    // Start the perception initialization
    // ============================================================================
    // Perception Initialization
    // Requests permission from the browser to access the webcam.
    // ============================================================================
    initWebcam();
});