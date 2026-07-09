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
    
    let attempt = 0;
    const maxRetries = 1;
    const baseDelayMs = 2000;

    while (attempt <= maxRetries) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("Reasoning: Summary generated successfully.");
            return response.text().trim();
        } catch (error) {
            const isTransient = error.status >= 500 || /network|timeout|503|502|500|fetch/i.test(error.message);
            if (isTransient && attempt < maxRetries) {
                attempt++;
                const backoff = baseDelayMs * Math.pow(2, attempt - 1);
                console.warn(`Reasoning: Transient API error (${error.message}). Retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
            } else {
                throw error; // Bubbles up to Infrastructure
            }
        }
    }
}

/**
 * Provider Adapter: Ollama Reasoning (Local)
 * Handles local LLM formatting and HTTP execution via native fetch.
 */
async function ollamaReasoningAdapter(logs) {
    const contextString = logs
        .map(log => `[${log.timestamp}] ${log.description}`)
        .join("\n");

    const prompt = `
You are Samantha. 
Summarize the user's recent activities naturally. 
Do not invent facts. 
Only use the supplied memory logs. 
Maximum 120 words.

Memory Logs:
${contextString}
    `;

    console.log("Reasoning: Generating summary via Local Ollama...");
    
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || "qwen2.5:3b",
            prompt: prompt,
            stream: false
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama API failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("Reasoning: Summary generated successfully.");
    return data.response.trim();
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