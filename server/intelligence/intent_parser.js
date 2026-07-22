/**
 * Intelligence Layer: Intent Parser
 * Translates raw user transcripts into a symbolic filter object.
 * It does NOT resolve dates; it only identifies the user's intent.
 */
function parseIntentToFilters(transcript) {
    const lowerQuery = transcript.toLowerCase();
    const symbolicFilters = {
        limit: 30
    };

    // Temporal Heuristics (Symbolic)
    if (lowerQuery.includes("yesterday")) {
        symbolicFilters.timeframe = "yesterday";
    } else if (lowerQuery.includes("this week")) {
        symbolicFilters.timeframe = "this_week";
    } else if (lowerQuery.includes("today")) {
        symbolicFilters.timeframe = "today";
    }

    // Semantic Heuristics
    const stopWords = ["what", "was", "i", "doing", "when", "did", "last", "samantha", "tell", "me", "about", "yesterday", "today", "week", "this", "my", "a", "the", "in", "on", "at", "how", "compare"];
    const words = lowerQuery.split(" ").filter(w => !stopWords.includes(w) && w.length > 2);
    if (words.length > 0) {
        symbolicFilters.keyword = words[0];
    }

    return symbolicFilters;
}

module.exports = { parseIntentToFilters };