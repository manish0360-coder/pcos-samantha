const db = require("../database/db");

/**
 * Generic Memory Search Engine
 * Translates structured temporal and semantic filters into optimized SQLite queries.
 * 
 * @param {Object} filters - Optional filters for the search
 * @param {string} [filters.from] - Start timestamp (e.g., '2026-07-10 00:00:00')
 * @param {string} [filters.to] - End timestamp (e.g., '2026-07-10 23:59:59')
 * @param {string} [filters.keyword] - Semantic keyword to filter descriptions
 * @param {number} [filters.limit=30] - Max records to return (defaults to 30 to protect LLM RAM)
 * @returns {Promise<Array<{timestamp: string, description: string}>>} - Filtered memory logs
 */
function searchMemory({ from, to, keyword, limit = 30 } = {}) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT timestamp, description FROM logs WHERE 1=1`;
        const params = [];

        // 1. Apply Temporal Filters
        if (from) {
            sql += ` AND timestamp >= ?`;
            params.push(from);
        }

        if (to) {
            sql += ` AND timestamp <= ?`;
            params.push(to);
        }

        // 2. Apply Semantic Filter
        if (keyword) {
            sql += ` AND description LIKE ?`;
            params.push(`%${keyword}%`);
        }

        // 3. Apply Safety Limit and Order
        sql += ` ORDER BY timestamp DESC LIMIT ?`;
        params.push(limit);

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error("Memory Error: Search failed.", err.message);
                reject(err);
            } else {
                console.log(`Memory: Search engine extracted ${rows.length} relevant logs.`);
                resolve(rows);
            }
        });
    });
}

// ============================================================================
// ISOLATED VERIFICATION TEST
// This block only runs if you execute this file directly. 
// It is ignored when imported by the Orchestrator.
// ============================================================================
if (require.main === module) {
    console.log("[DEBUG] Running isolated memory search test...");
    
    // Simulating a structured request from a future Intent Router
    const testFilters = {
        keyword: "desk", // Search for something you did recently
        limit: 5
    };

    searchMemory(testFilters).then(logs => {
        console.table(logs);
        process.exit(0);
    }).catch(() => process.exit(1));
}

module.exports = { searchMemory };