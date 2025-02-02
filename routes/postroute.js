const express = require("express");
const router = express.Router();
const db = require("../db"); // Assuming MySQL connection is set up
const authenticateToken = require("../middleware/authMiddleware"); // JWT Middleware

// Create a new post
router.post("/post", authenticateToken, async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id; // Extracted from JWT

    if (!content.trim()) {
        return res.status(400).json({ error: "Post content cannot be empty" });
    }

    try {
        const sql = "INSERT INTO posts (content, userId) VALUES (?, ?)";
        await db.query(sql, [content, userId]);
        res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all posts
router.get("/post", async (req, res) => {
    try {
        const sql = `
            SELECT posts.id, posts.content, posts.createdAt, users.name
            FROM posts
            INNER JOIN users ON posts.userId = users.id
            ORDER BY posts.createdAt DESC`;
        
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
