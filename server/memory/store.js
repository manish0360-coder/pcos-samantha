const db = require("../database/db");

/**
 * Saves a visual description log to the database.
 * 
 * @param {string} description - The text description returned by the Vision API.
 * @returns {Promise<void>}
 */
function saveLog(description) {
    return new Promise((resolve, reject) => {
        const insertLogQuery = `INSERT INTO logs (description) VALUES (?)`;
        
        db.run(insertLogQuery, [description], function (err) {
            if (err) {
                console.error("Memory Error: Failed to save log.", err.message);
                reject(err);
            } else {
                console.log(
                    `Memory: Log saved at ${new Date().toISOString()}`
                );
                resolve();
            }
        });
    });
}

module.exports = { saveLog };