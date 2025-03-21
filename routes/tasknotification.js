const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Get all notifications for a user
router.get("/:user_id", (req, res) => {
    const { user_id } = req.params;

    const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Error fetching notifications:", err);
            return res.status(500).json({ error: "Error fetching notifications" });
        }
        res.json(results);
    });
});

// Get unread notifications count
router.get("/count/:user_id", (req, res) => {
    const { user_id } = req.params;

    const sql = "SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0";
    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("Error fetching unread count:", err);
            return res.status(500).json({ error: "Error fetching unread count" });
        }
        res.json(result[0]); // Returns { unread_count: X }
    });
});

// Mark all notifications as read
router.put("/mark-read/:user_id", (req, res) => {
    const { user_id } = req.params;

    const sql = "UPDATE notifications SET is_read = 1 WHERE user_id = ?";
    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("Error marking notifications as read:", err);
            return res.status(500).json({ error: "Error marking notifications as read" });
        }
        res.json({ message: "All notifications marked as read" });
    });
});

module.exports = router;
