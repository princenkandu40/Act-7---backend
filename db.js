
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Get database path from environment variable
// Use local database path if DB_PATH is not provided
const configuredPath =
    process.env.DB_PATH || "database/campus_maintenance.db";

// Convert to absolute path
const databasePath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(__dirname, configuredPath);

// Create database folder if it does not exist
const databaseFolder = path.dirname(databasePath);

if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder, { recursive: true });
}

// Connect to SQLite database
const db = new Database(databasePath);

// Create records table
const schema = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf8"
);

db.exec(schema);

// Insert sample records if the table is empty
const result = db.prepare(
    "SELECT COUNT(*) AS total FROM records"
).get();

if (result.total === 0) {
    const seed = fs.readFileSync(
        path.join(__dirname, "seed.sql"),
        "utf8"
    );

    db.exec(seed);
}

module.exports = db;
