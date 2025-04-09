const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Route to get referral request by user_id and job_id from params
router.get('/referral-request/:user_id/:job_id', (req, res) => {
    const { user_id, job_id } = req.params;

    const sql = `
        SELECT * FROM referral_requests 
        WHERE user_id = ? AND job_id = ?
    `;

    db.query(sql, [user_id, job_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No referral request found' });
        }

        res.json(results[0]);
    });
});

module.exports = router;
