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


module.exports = router;
