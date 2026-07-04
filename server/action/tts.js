/**
 * Action Module: Converts text to speech.
 * Provider-agnostic interface. Currently defaults to OpenAI TTS API via native fetch.
 * 
 * @param {string} text - The synthesized reasoning text.
 * @returns {Promise<string>} Base64 encoded audio string.
 * @throws {Error} If API key is missing or network request fails.
 */
/**
 * Provider Adapter: OpenAI
 * Handles vendor-specific HTTP formatting and parsing.
 */
async function openAiTTSAdapter(text) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured for OpenAI.");
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "tts-1",
            voice: "nova",
            input: text
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI TTS failed with HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
}

/**
 * Action Module: Converts text to speech.
 * Routes to the correct provider adapter based on infrastructure configuration.
 * 
 * @param {string} text - The synthesized reasoning text.
 * @returns {Promise<string>} Base64 encoded audio string.
 */
async function generateSpeech(text) {
    // Read provider from config, default to "openai"
    const provider = (process.env.TTS_PROVIDER || "openai").toLowerCase();

    if (provider === "openai") {
        return await openAiTTSAdapter(text);
    }
    
    // Future adapters (e.g., ElevenLabs, Local) can be routed here
    throw new Error(`Unsupported TTS_PROVIDER configured: ${provider}`);
}

module.exports = { generateSpeech };