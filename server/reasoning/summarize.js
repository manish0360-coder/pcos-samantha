const { GoogleGenerativeAI } = require("@google/generative-ai");
const aiConfig = require("../config/providers");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set.");
}
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Provider Adapter: Gemini Reasoning
 * Handles Google Generative AI specific formatting and execution.
 */
async function geminiReasoningAdapter(logs) {
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
    
    // Operational failures bubble up to Infrastructure
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log("Reasoning: Summary generated successfully.");
    return response.text().trim();
}

const adapters = {
    gemini: geminiReasoningAdapter
};

/**
 * Reasoning Service Layer
 * Routes the logs to the correct provider adapter based on configuration.
 * 
 * @param {Array<{timestamp: string, description: string}>} logs 
 * @returns {Promise<string>}
 */
async function generateSummary(logs) {
    // Universal business logic: abort early if memory is empty
    if (!logs || logs.length === 0) {
        return "I don't have any recent memories to summarize.";
    }

    const provider = aiConfig.reasoning;
    const adapter = adapters[provider];

    if (!adapter) {
        throw new Error(`Unsupported REASONING_PROVIDER configured: ${provider}`);
    }

    return await adapter(logs);
}

module.exports = { generateSummary };