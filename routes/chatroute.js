const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Search users by name
router.post('/search', (req, res) => {
    const searchQuery = `%${req.body.query.trim()}%`; // Trim spaces and add wildcards for the LIKE query
    console.log("Search Query:", searchQuery);  // Log the raw search query

    const sql = "SELECT id, name FROM users WHERE LOWER(name) LIKE LOWER(?)";
    
    console.log("SQL Query:", sql);  // Log the query string
    console.log("Query Parameters:", searchQuery);  // Log the query parameters
    
    db.query(sql, [searchQuery], (err, results) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: err.message });
        }

        console.log("Search Results:", results);  // Log the results
        res.json(results);  // Send the results to the client
    });
});

module.exports = router;
