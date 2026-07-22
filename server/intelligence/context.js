const CONTEXT_HISTORY_LIMIT = 5;

/**
 * Working Memory (Conversation Context)
 * Manages a fixed-size history of the recent conversation turns.
 */
class ConversationContext {
    constructor() {
        this.history = [];
    }

    /**
     * Adds a turn to the conversation history.
     * @param {'user' | 'assistant'} role - The speaker.
     * @param {string} content - The spoken text.
     */
    addTurn(role, content) {
        this.history.push({ role, content });
        // Enforce the history limit by keeping only the last N turns
        if (this.history.length > CONTEXT_HISTORY_LIMIT) {
            this.history = this.history.slice(-CONTEXT_HISTORY_LIMIT);
        }
        console.log(`Context: Added turn. History now contains ${this.history.length} items.`);
    }

    /**
     * Retrieves the current conversation history.
     * @returns {Array<{role: string, content: string}>}
     */
    getHistory() {
        return this.history;
    }

    /**
     * Clears the conversation history.
     */
    clear() {
        this.history = [];
        console.log("Context: History cleared.");
    }
}

// Create a singleton instance for our single-user application
const conversationContext = new ConversationContext();

module.exports = conversationContext;