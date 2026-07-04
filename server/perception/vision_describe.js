const { GoogleGenerativeAI } = require("@google/generative-ai");
const aiConfig = require("../config/providers");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set in your environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Sends a Base64 image to the Gemini Vision API.
 * 
 * @param {string} base64DataUrl - The data URL from the canvas.
 * @returns {Promise<string>} A short text description.
 * @throws {Error} Operational failures (e.g., HTTP 429, 500) are thrown to the Orchestrator.
 */
async function describeImage(base64DataUrl) {
    if (aiConfig.vision !== "gemini") {
        throw new Error(`Unsupported VISION_PROVIDER configured: ${aiConfig.vision}`);
    }

    const base64Data = base64DataUrl.split(",")[1];
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = "Describe what the user is doing in 10 words or less. Focus on physical actions.";

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: "image/jpeg"
        }
    };

    // We do not catch errors here. Operational failures must bubble up to Infrastructure.
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text().trim();
}

module.exports = { describeImage };