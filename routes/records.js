
const express = require("express");
const db = require("../db");

const router = express.Router();

// Validate record information
function validateRecord(body) {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return { error: "Request body must be a JSON object." };
    }

    const fields = ["title", "category", "description", "status"];

    for (const field of fields) {
        if (typeof body[field] !== "string") {
            return { error: `${field} must be a string.` };
        }

        if (body[field].trim() === "") {
            return { error: `${field} cannot be empty.` };
        }
    }

    const record = {
        title: body.title.trim(),
        category: body.category.trim(),
        description: body.description.trim(),
        status: body.status.trim()
    };

    if (record.title.length < 3 || record.title.length > 80) {
        return { error: "Title must be between 3 and 80 characters." };
    }

    if (record.category.length < 2 || record.category.length > 40) {
        return { error: "Category must be between 2 and 40 characters." };
    }

    if (
        record.description.length < 5 ||
        record.description.length > 300
    ) {
        return { error: "Description must be between 5 and 300 characters." };
    }

    const allowedStatuses = ["Pending", "In progress", "Completed"];

    if (!allowedStatuses.includes(record.status)) {
        return {
            error: "Status must be Pending, In progress, or Completed."
        };
    }

    return { record };
}

// Validate record ID
function getValidId(id) {
    if (!/^[1-9]\d*$/.test(id)) {
        return null;
    }

    const number = Number(id);

    return Number.isSafeInteger(number) ? number : null;
}

// GET all records
router.get("/", (req, res, next) => {
    try {
        const records = db.prepare(
            "SELECT * FROM records ORDER BY id"
        ).all();

        res.status(200).json(records);
    } catch (error) {
        next(error);
    }
});

// GET one record
router.get("/:id", (req, res, next) => {
    try {
        const id = getValidId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const record = db.prepare(
            "SELECT * FROM records WHERE id = ?"
        ).get(id);

        if (!record) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(record);
    } catch (error) {
        next(error);
    }
});

// POST create a record
router.post("/", (req, res, next) => {
    try {
        const validation = validateRecord(req.body);

        if (validation.error) {
            return res.status(400).json({
                message: validation.error
            });
        }

        const { title, category, description, status } =
            validation.record;

        const result = db.prepare(`
            INSERT INTO records (title, category, description, status)
            VALUES (?, ?, ?, ?)
        `).run(title, category, description, status);

        const newRecord = db.prepare(
            "SELECT * FROM records WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json(newRecord);
    } catch (error) {
        next(error);
    }
});

// PUT update a record
router.put("/:id", (req, res, next) => {
    try {
        const id = getValidId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const existingRecord = db.prepare(
            "SELECT * FROM records WHERE id = ?"
        ).get(id);

        if (!existingRecord) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        const validation = validateRecord(req.body);

        if (validation.error) {
            return res.status(400).json({
                message: validation.error
            });
        }

        const { title, category, description, status } =
            validation.record;

        db.prepare(`
            UPDATE records
            SET title = ?,
                category = ?,
                description = ?,
                status = ?
            WHERE id = ?
        `).run(title, category, description, status, id);

        const updatedRecord = db.prepare(
            "SELECT * FROM records WHERE id = ?"
        ).get(id);

        res.status(200).json(updatedRecord);
    } catch (error) {
        next(error);
    }
});

// DELETE a record
router.delete("/:id", (req, res, next) => {
    try {
        const id = getValidId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const result = db.prepare(
            "DELETE FROM records WHERE id = ?"
        ).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json({
            message: "Record deleted."
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;