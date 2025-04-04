const express = require('express');
const db = require('../config/db');
const router = express.Router();


router.get('/leaderboard/posts', (req, res) => {
    const sql = `
        SELECT u.id, u.name, COUNT(p.id) AS total_posts
        FROM users u
        LEFT JOIN posts p ON u.id = p.userId
        GROUP BY u.id
        ORDER BY total_posts DESC
        LIMIT 10
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


router.get('/leaderboard/connections', (req, res) => {
    const sql = `
        SELECT u.id, u.name, COUNT(c.id) AS accepted_connections
        FROM users u
        LEFT JOIN connections c 
            ON u.id = c.sender_id OR u.id = c.receiver_id
        WHERE c.status = 'accepted'
        GROUP BY u.id
        ORDER BY accepted_connections DESC
        LIMIT 10
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
