const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Create a Post
router.post('/post', (req, res) => {
    console.log("Received request body:", req.body); // Debugging step

    const { content, userId } = req.body;

    if (!content || !userId) {
        return res.status(400).json({ error: "Content and userId are required" });
    }

    const sql = "INSERT INTO posts (content, userId) VALUES (?, ?)";
    db.query(sql, [content, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ message: 'Post created successfully', postId: result.insertId });
    });
});

// Fetch All Posts
router.get('/post', (req, res) => {
    const sql = `SELECT posts.id, posts.content, posts.createdAt, users.name 
                 FROM posts JOIN users ON posts.userId=users.id 
                 ORDER BY posts.createdAt DESC`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(result);
    });
});

module.exports = router;
