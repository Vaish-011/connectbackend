const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// POST: Add or remove bookmark
router.post('/', async (req, res) => {
  const { userId, postId, isBookmarked } = req.body;

  try {
    if (isBookmarked) {
      // Add to bookmarks
      await db.query('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [userId, postId]);
    } else {
      // Remove from bookmarks
      await db.query('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?', [userId, postId]);
    }

    res.status(200).json({ message: 'Bookmark updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET: Check if a post is bookmarked by user
router.get('/check/:userId/:postId', async (req, res) => {
  const { userId, postId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM bookmarks WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    const isBookmarked = rows.length > 0;
    res.json({ isBookmarked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


//  GET: All bookmarked posts for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT post_id FROM bookmarks WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({ bookmarkedPosts: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
