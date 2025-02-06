const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Send Connection Request
router.post("/connect", (req, res) => {
    const { sender_id, receiver_id } = req.body;
    db.query(
        "INSERT INTO connections (sender_id, receiver_id) VALUES (?, ?)",
        [sender_id, receiver_id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Connection request sent" });
        }
    );
});

// Get Connection Requests
router.get("/connections/:userId", (req, res) => {
    const { userId } = req.params;
    db.query(
        "SELECT c.id, u.name, c.status FROM connections c JOIN users u ON u.id = c.sender_id WHERE c.receiver_id = ? AND c.status = 'accepted'",
        [userId],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

// Accept Connection Request
router.put("/connections/:connectionId/accept", (req, res) => {
    const { connectionId } = req.params;
    db.query(
        "UPDATE connections SET status = 'accepted' WHERE id = ?",
        [connectionId],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Connection request accepted" });
        }
    );
});

// Reject Connection Request
router.put("/connections/:connectionId/reject", (req, res) => {
    const { connectionId } = req.params;
    db.query(
        "UPDATE connections SET status = 'rejected' WHERE id = ?",
        [connectionId],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Connection request rejected" });
        }
    );
});

module.exports = router;
