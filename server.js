
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

const origins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

app.use(cors({ origin: origins }));
app.use(express.json());

// Home route - API guide
app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Campus Maintenance Management API</title>
        </head>
        <body>
            <h1>Campus Maintenance Management System API</h1>

            <p><strong>Student Number:</strong> 202506829</p>

            <p>
                This API manages campus maintenance requests.
                It allows clients to create, read, update and delete records.
            </p>

            <h2>API Links</h2>
            <ul>
                <li><a href="/health">Health Check</a></li>
                <li><a href="/api/records">All Records</a></li>
            </ul>

            <h2>Available Routes</h2>

            <table border="1" cellpadding="8">
                <tr><th>Method</th><th>Route</th><th>Purpose</th></tr>
                <tr><td>GET</td><td>/</td><td>Show API guide</td></tr>
                <tr><td>GET</td><td>/health</td><td>Check server and database</td></tr>
                <tr><td>GET</td><td>/api/records</td><td>Get all records</td></tr>
                <tr><td>GET</td><td>/api/records/:id</td><td>Get one record</td></tr>
                <tr><td>POST</td><td>/api/records</td><td>Create a record</td></tr>
                <tr><td>PUT</td><td>/api/records/:id</td><td>Update a record</td></tr>
                <tr><td>DELETE</td><td>/api/records/:id</td><td>Delete a record</td></tr>
            </table>

            <h2>Record Fields</h2>
            <p>title: 3 to 80 characters</p>
            <p>category: 2 to 40 characters</p>
            <p>description: 5 to 300 characters</p>
            <p>status: Pending, In progress, Completed</p>

            <h2>Example Request Body</h2>
            <pre>
{
    "title": "Broken classroom light",
    "category": "Electrical",
    "description": "The light in Room B12 does not switch on.",
    "status": "Pending"
}
            </pre>

            <h2>Response Codes</h2>
            <p>200: Successful request</p>
            <p>201: Record created</p>
            <p>400: Invalid input</p>
            <p>404: Record or route not found</p>
            <p>500: Server error</p>
            <p>503: Database unavailable</p>

            <p>Note: An idle hosted service may take some time to start.</p>
        </body>
        </html>
    `);
});

// Health check - SQLite
app.get("/health", (req, res) => {
    try {
        db.prepare("SELECT 1").get();

        res.status(200).json({
            status: "success",
            message: "Server and database are working."
        });
    } catch (error) {
        console.error("Health check failed:", error);

        res.status(503).json({
            message: "Database is unavailable."
        });
    }
});

// Record routes
app.use("/api/records", require("./routes/records"));

// Unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.error(error);

    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
    ) {
        return res.status(400).json({
            message: "Invalid JSON format."
        });
    }

    res.status(500).json({
        message: "An unexpected server error occurred."
    });
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
});
