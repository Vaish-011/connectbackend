const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Your database connection

// Toggle Bookmark
router.post("/bookmark", async (req, res) => {
    const { user_id, post_id } = req.body;
    
    if (!user_id || !post_id) return res.status(400).json({ message: "Missing fields" });

    try {
        const [existing] = await db.query("SELECT * FROM bookmarks WHERE user_id = ? AND post_id = ?", [user_id, post_id]);

        if (existing.length > 0) {
            // If exists, remove bookmark
            await db.query("DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?", [user_id, post_id]);
            return res.json({ message: "Bookmark removed" });
        } else {
            // Otherwise, add bookmark
            await db.query("INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)", [user_id, post_id]);
            return res.json({ message: "Bookmark added" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get User's Bookmarked Posts
router.get("/bookmarked-posts/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const [bookmarks] = await db.query(`
            SELECT posts.* FROM posts 
            JOIN bookmarks ON posts.id = bookmarks.post_id 
            WHERE bookmarks.user_id = ?
        `, [user_id]);

        res.json(bookmarks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
