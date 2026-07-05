const { GoogleGenerativeAI } = require("@google/generative-ai");
const aiConfig = require("../config/providers");

// Initialize Google Generative AI SDK
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set.");
}
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Synthesizes a natural language summary from an array of memory logs.
 * 
 * @param {Array<{timestamp: string, description: string}>} logs 
 * @returns {Promise<string>}
 */
async function generateSummary(logs) {
    if (aiConfig.reasoning !== "gemini") {
        throw new Error(`Unsupported REASONING_PROVIDER configured: ${aiConfig.reasoning}`);
    }
    
    if (!logs || logs.length === 0) {
        return "I don't have any recent memories to summarize.";
    }

    try {
        // Format logs into a readable timeline context for the LLM
        const contextString = logs
            .map(log => `[${log.timestamp}] ${log.description}`)
            .join("\n");

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are Samantha. 
Summarize the user's recent activities naturally. 
Do not invent facts. 
Only use the supplied memory logs. 
Maximum 120 words.

Memory Logs:
${contextString}
        `;

        console.log("Reasoning: Generating summary via Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        console.log("Reasoning: Summary generated successfully.");
        return text;

    } catch (error) {
        console.error("Reasoning Error: Failed to generate summary.", error.message);
        throw error; // Bubble up operational failures to Infrastructure
    }
}

module.exports = { generateSummary };