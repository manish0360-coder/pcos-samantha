const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI SDK using the environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set in your environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Sends a Base64 image to the Gemini Vision API and returns a short description.
 * 
 * @param {string} base64DataUrl - The data URL from the canvas (e.g., "data:image/jpeg;base64,...")
 * @returns {Promise<string>} A short text description of the image.
 */
async function describeImage(base64DataUrl) {
    try {
        // Strip the "data:image/jpeg;base64," prefix to isolate the raw base64 data
        const base64Data = base64DataUrl.split(",")[1];
        
        // Use gemini-1.5-flash as it is optimized for fast, multimodal tasks
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });

        // Enforce the 10-word limit and physical action focus via prompt engineering
        const prompt = "Describe what the user is doing in 10 words or less. Focus on physical actions.";

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text().trim();

        return text;
    } catch (error) {
        console.error("Perception API Error:", error.message);
        return "Error analyzing frame.";
    }
}

module.exports = { describeImage };