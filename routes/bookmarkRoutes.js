const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Toggle bookmark (add/remove)
router.post('/toggle', async (req, res) => {
  const { user_id, post_id } = req.body;

  // Validate input
  if (!user_id || !post_id) {
    return res.status(400).json({ error: 'user_id and post_id are required' });
  }

  console.log("Toggle bookmark called with:", { user_id, post_id });

  try {
    // Check if user exists in the users table
    const [userRows] = await db.promise().query(
      'SELECT * FROM users WHERE id = ?',
      [user_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if post exists in the posts table
    const [postRows] = await db.promise().query(
      'SELECT * FROM posts WHERE id = ?',
      [post_id]
    );

    if (postRows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the bookmark already exists
    const [rows] = await db.promise().query(
      'SELECT * FROM bookmarks WHERE user_id = ? AND post_id = ?',
      [user_id, post_id]
    );

    if (rows.length > 0) {
      // If it exists, remove the bookmark
      await db.promise().query(
        'DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?',
        [user_id, post_id]
      );
      console.log(' Bookmark removed');
      res.json({ message: 'Bookmark removed' });
    } else {
      // If it doesn't exist, add the bookmark
      await db.promise().query(
        'INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)',
        [user_id, post_id]
      );
      console.log(' Bookmark added');
      res.json({ message: 'Bookmark added' });
    }
  } catch (err) {
    console.error(' DB Error:', err);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// Get all bookmarked posts for a user
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const [rows] = await db.promise().query(
      `SELECT 
        b.id AS bookmark_id,
        b.user_id,
        b.post_id,
        p.*, 
        b.created_at AS bookmarked_at
      FROM bookmarks b
      JOIN posts p ON b.post_id = p.id
      WHERE b.user_id = ?`,
      [userId]
    );

    console.log(` Bookmarks fetched for user ${userId}:`, rows.length);
    res.json(rows);
  } catch (err) {
    console.error(' Fetch bookmarks error:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

module.exports = router;
