const { GoogleGenerativeAI } = require("@google/generative-ai");
const aiConfig = require("../config/providers");


/**
 * Provider Adapter: Gemini Q&A
 */
async function geminiAnswerAdapter({ question, evidence }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) console.warn("WARNING: GEMINI_API_KEY is not set.");
    const genAI = new GoogleGenerativeAI(apiKey || "dummy-key");
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const contextString = evidence.map(log => `[${log.timestamp}] ${log.description}`).join("\n");
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = `You are Samantha.

Answer ONLY using the supplied memory logs.

Never invent memories.
Never infer events.
Never speculate.

If the supplied evidence does not contain enough information, reply exactly:

"I don't know based on my current memories."

Question:
"${question}"

Memory Logs:
${contextString}`;
    
    console.log(`Reasoning: Generating answer via Gemini (${modelName})...`);
    
    let attempt = 0;
    const maxRetries = 1;
    const baseDelayMs = 2000;

    while (attempt <= maxRetries) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("Reasoning: Answer generated successfully.");
            return response.text().trim();
        } catch (error) {
            const isTransient = error.status >= 500 || /network|timeout|503|502|500|fetch/i.test(error.message);
            if (isTransient && attempt < maxRetries) {
                attempt++;
                const backoff = baseDelayMs * Math.pow(2, attempt - 1);
                console.warn(`Reasoning: Transient API error (${error.message}). Retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
            } else {
                throw error;
            }
        }
    }
}

/**
 * Provider Adapter: Ollama Q&A (Local)
 */
async function ollamaAnswerAdapter({ question, evidence }) {
    const contextString = evidence.map(log => `[${log.timestamp}] ${log.description}`).join("\n");
    
    const prompt = `You are Samantha.

Answer ONLY using the supplied memory logs.

Never invent memories.
Never infer events.
Never speculate.

If the supplied evidence does not contain enough information, reply exactly:

"I don't know based on my current memories."

Question:
"${question}"

Memory Logs:
${contextString}`;
    
    const ollamaModel = process.env.OLLAMA_MODEL || "qwen2.5:3b";
    console.log(`Reasoning: Generating answer via Local Ollama (${ollamaModel})...`);
    
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: ollamaModel,
            prompt: prompt,
            stream: false
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama API failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("Reasoning: Answer generated successfully.");
    return data.response.trim();
}

// Registry Map for OCP routing
const adapters = {
    gemini: geminiAnswerAdapter,
    ollama: ollamaAnswerAdapter
};

/**
 * Q&A Service Layer
 * Routes the question and evidence to the correct provider adapter.
 * 
 * @param {Object} params
 * @param {string} params.question - The natural language question
 * @param {Array<{timestamp: string, description: string}>} params.evidence - The retrieved memory logs
 * @returns {Promise<string>}
 */
async function answerQuestion({ question, evidence }) {
    // Universal business logic: abort early if memory is empty
    if (!evidence || evidence.length === 0) {
        return "I don't know based on my current memories.";
    }

    const provider = aiConfig.reasoning;
    const adapter = adapters[provider];

    if (!adapter) {
        throw new Error(`Unsupported REASONING_PROVIDER configured: ${provider}`);
    }

    return await adapter({ question, evidence });
}

// ============================================================================
// ISOLATED VERIFICATION TEST
// ============================================================================
if (require.main === module) {
    require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });
    console.log("[DEBUG] Running isolated reasoning answer test...");
    
    // We provide evidence about typing code, but ask about drinking coffee.
    // This tests the anti-hallucination prompt.
    const mockEvidence = [
        { timestamp: "2026-07-10 14:00:00", description: "User is typing code at their desk." }
    ];
    const mockQuestion = "Was I drinking coffee yesterday?";
    
    answerQuestion({ question: mockQuestion, evidence: mockEvidence })
        .then(answer => {
            console.log("\n================ SAMANTHA'S ANSWER ================");
            console.log(`"${answer}"`);
            console.log("===================================================");
            process.exit(0);
        })
        .catch(err => {
            console.error("Test failed:", err.message);
            process.exit(1);
        });
}

module.exports = { answerQuestion };