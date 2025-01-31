const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Middleware to extract userId from session or token (Modify according to your auth system)
const authenticateUser = (req, res, next) => {
    const userId = req.session?.userId; // If using sessions
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }
    req.userId = userId;
    next();
};

// Create a Post (Now using authenticated user ID)
router.post('/post', authenticateUser, (req, res) => {
    const { content } = req.body;
    const userId = req.userId; // Retrieved from session

    const sql = "INSERT INTO posts (content, userId) VALUES (?, ?)";
    db.query(sql, [content, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Post created successfully', postId: result.insertId });
    });
});

// Fetch all Posts with User Details
router.get('/post', (req, res) => {
    const sql = `
        SELECT posts.id, posts.content, posts.createdAt, users.name 
        FROM posts 
        JOIN users ON posts.userId = users.id 
        ORDER BY posts.createdAt DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

module.exports = router;
