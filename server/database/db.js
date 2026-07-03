const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Resolve the path to the root directory for the SQLite file
const dbPath = path.join(__dirname, "../../database.sqlite");

// Initialize and connect to the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database Error: Could not connect to SQLite.", err.message);
    } else {
        console.log("Infrastructure: Connected to SQLite database.");
        
        // Initialize the logs table if it does not exist
        // Persistent episodic memory.
        // Each row represents one visual observation.
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                description TEXT NOT NULL
            )
        `;
        
        db.run(createTableQuery, (createErr) => {
            if (createErr) {
                console.error("Database Error: Could not create logs table.", createErr.message);
            }
        });
    }
});

module.exports = db;