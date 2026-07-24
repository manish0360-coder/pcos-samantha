const conversationContext = require("./context");
const { searchMemory } = require("../memory/search");

/**
 * Internal Helper: Resolves symbolic timeframes into concrete timestamps for the Memory Layer.
 */
function resolveSymbolicTime(filters) {
    if (!filters.timeframe) return filters;

    const now = new Date();
    let from, to;

    switch (filters.timeframe) {
        case "today":
            from = new Date(now.setHours(0, 0, 0, 0));
            break;
        case "yesterday":
            to = new Date(now.setHours(0, 0, 0, 0));
            now.setDate(now.getDate() - 1);
            from = new Date(now.setHours(0, 0, 0, 0));
            break;
        case "this_week":
            from = new Date(now.setDate(now.getDate() - 7));
            from.setHours(0, 0, 0, 0);
            break;
    }
    
    const concreteFilters = { ...filters };
    if (from) concreteFilters.from = from.toISOString();
    if (to) concreteFilters.to = to.toISOString();
    
    delete concreteFilters.timeframe;

    return concreteFilters;
}

/**
 * Normalizes raw conversation history into the standard evidence format.
 */
function normalizeWorkingMemory(history) {
    return history.map((turn, index) => ({
        id: `wm_${index}`, // Add stable, unique ID for attribution
        source: 'working_memory',
        timestamp: new Date().toISOString(),
        content: `[${turn.role}] ${turn.content}`
    }));
}

/**
 * Normalizes raw SQLite logs into the standard evidence format.
 */
function normalizeEpisodicMemory(logs) {
    return logs.map(log => ({
        id: `em_${log.id}`, // Add stable, unique ID referencing the SQLite primary key
        source: 'episodic_memory',
        timestamp: log.timestamp,
        content: log.description
    }));
}

/**
 * Memory Federation Service
 * Collects evidence from all memory sources based on symbolic intent.
 * 
 * @param {object} symbolicIntent - The structured output from the Intent Parser.
 * @returns {Promise<Array<object>>} A normalized array of evidence.
 */
async function collectEvidence({ symbolicIntent }) {
    console.log("Federation: Collecting evidence for intent:", symbolicIntent);

    // 1. Collect from Working Memory
    const workingMemoryHistory = conversationContext.getHistory();
    const normalizedWorkingMemory = normalizeWorkingMemory(workingMemoryHistory);

    // 2. Resolve time and delegate to Episodic Memory
    const concreteFilters = resolveSymbolicTime(symbolicIntent);
    const episodicLogs = await searchMemory(concreteFilters);
    const normalizedEpisodicMemory = normalizeEpisodicMemory(episodicLogs);

    // 3. Federate and return
    const federatedEvidence = [...normalizedWorkingMemory, ...normalizedEpisodicMemory];
    console.log(`Federation: Collected ${federatedEvidence.length} total pieces of evidence.`);
    return federatedEvidence;
}

module.exports = { collectEvidence };