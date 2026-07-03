const db = require("../database/db");

/**
 * Retrieves the most recent visual observation logs from the database.
 * 
 * @param {number} limit - The maximum number of logs to retrieve.
 * @returns {Promise<Array<{timestamp: string, description: string}>>}
 */

/**
 * Retrieves recent episodic memory entries.
 *
 * Memory owns all database reads.
 */
function getRecentLogs(limit = 20) {
    return new Promise((resolve, reject) => {
        // Retrieve newest logs first using DESC ordering
        const query = `
            SELECT timestamp, description 
            FROM logs 
            ORDER BY timestamp DESC 
            LIMIT ?
        `;
        
        db.all(query, [limit], (err, rows) => {
            if (err) {
                console.error("Memory Error: Failed to retrieve logs.", err.message);
                reject(err);
            } else {
                console.log(`Memory: Retrieved ${rows.length} recent logs.`);
                resolve(rows);
            }
        });
    });
}

module.exports = { getRecentLogs };