const { GoogleGenerativeAI } = require("@google/generative-ai");
const aiConfig = require("../config/providers");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set in your environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Provider Adapter: Gemini Vision
 * Handles Google Generative AI specific formatting and execution.
 */
async function geminiVisionAdapter(base64DataUrl) {
    const base64Data = base64DataUrl.split(",")[1];
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = "Describe what the user is doing in 10 words or less. Focus on physical actions.";

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: "image/jpeg"
        }
    };

    // Operational failures bubble up to Infrastructure
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text().trim();
}

const adapters = {
    gemini: geminiVisionAdapter
};

/**
 * Vision Service Layer
 * Routes the image to the correct provider adapter based on configuration.
 * 
 * @param {string} base64DataUrl - The data URL from the canvas.
 * @returns {Promise<string>} A short text description.
 */
async function describeImage(base64DataUrl) {
    const provider = aiConfig.vision;
    const adapter = adapters[provider];

    if (!adapter) {
        throw new Error(`Unsupported VISION_PROVIDER configured: ${provider}`);
    }

    return await adapter(base64DataUrl);
}

module.exports = { describeImage };