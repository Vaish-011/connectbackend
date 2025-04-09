const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Store uploads in a local directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get file extension
        const filename = Date.now() + ext; // Create a unique filename
        cb(null, filename);
    }
});

const upload = multer({ storage });

// Create a Post with file upload
router.post('/post', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'article', maxCount: 1 },
    { name: 'event', maxCount: 1 }
]), (req, res) => {
    const { content, userId } = req.body;
    const { photo, video, article, event } = req.files;

    if (!content || !userId) {
        return res.status(400).json({ error: "Content and userId are required" });
    }

    // Collect file paths for the uploaded files
    const filePaths = {
        photo: photo ? photo[0].path : null,
        video: video ? video[0].path : null,
        article: article ? article[0].path : null,
        event: event ? event[0].path : null,
    };

    // Insert post into database
    const sql = "INSERT INTO posts (content, userId, photo, video, article, event) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [
        content, 
        userId,
        filePaths.photo,
        filePaths.video,
        filePaths.article,
        filePaths.event
    ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
            message: 'Post created successfully',
            postId: result.insertId,
            filePaths: filePaths,
        });
    });
});

// Fetch All Posts
router.get('/post', (req, res) => {
    const sql = `SELECT posts.id, posts.content, posts.createdAt, posts.photo, posts.video, posts.article, posts.event, users.name 
                 FROM posts JOIN users ON posts.userId = users.id 
                 ORDER BY posts.createdAt DESC`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(result);

    });
});


// Fetch Posts by User ID (via route param)
router.get('/post/user/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = `SELECT posts.id, posts.content, posts.createdAt, posts.photo, posts.video, posts.article, posts.event, users.name 
                 FROM posts JOIN users ON posts.userId = users.id 
                 WHERE users.id = ? 
                 ORDER BY posts.createdAt DESC`;

    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Delete a post by ID
router.delete('/post/:id', (req, res) => {
    const postId = req.params.id;

    const sql = 'DELETE FROM posts WHERE id = ?';
    db.query(sql, [postId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ message: 'Post deleted successfully' });
    });
});



router.post('/post/:id/like', (req, res) => {
    const { userId } = req.body;
    const postId = req.params.id;
  
    if (!userId) return res.status(400).json({ error: "userId is required" });
  
    const sql = "INSERT IGNORE INTO likes (userId, postId) VALUES (?, ?)";
    db.query(sql, [userId, postId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Post liked successfully" });
    });
  });
  
  router.post('/post/:id/comment', (req, res) => {
    const { userId, content } = req.body;
    const postId = req.params.id;
  
    if (!userId || !content) {
      return res.status(400).json({ error: "userId and content are required" });
    }
  
    const sql = "INSERT INTO comments (userId, postId, content) VALUES (?, ?, ?)";
    db.query(sql, [userId, postId, content], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Comment added successfully" });
    });
  });
  
  


  router.get('/post/:id/stats', (req, res) => {
    const postId = req.params.id;
  
    const likeSQL = "SELECT COUNT(*) AS likes FROM likes WHERE postId = ?";
    const commentSQL = "SELECT COUNT(*) AS comments FROM comments WHERE postId = ?";
  
    const results = {};
  
    db.query(likeSQL, [postId], (err, likeResult) => {
      if (err) return res.status(500).json({ error: err.message });
  
      results.likes = likeResult[0].likes;
  
      db.query(commentSQL, [postId], (err, commentResult) => {
        if (err) return res.status(500).json({ error: err.message });
  
        results.comments = commentResult[0].comments;
  
        res.json(results);
      });
    });
  });
  

  router.get('/comments/:postId', (req, res) => {
    const postId = req.params.postId;
    const sql = `SELECT comments.*, users.name as userName 
                 FROM comments 
                 JOIN users ON comments.userId = users.id 
                 WHERE postId = ? 
                 ORDER BY comments.createdAt DESC`;
  
    db.query(sql, [postId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });
  
  






module.exports = router;
