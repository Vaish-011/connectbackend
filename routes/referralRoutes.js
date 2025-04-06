const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post("/request", upload.single("resume"), (req, res) => {
    console.log("Received referral request:", req.body);
    console.log("File received:", req.file);
    const { job_id, user_id, name, email, message } = req.body;
    const resumePath = req.file ? req.file.path : null;

    if (!job_id || !user_id || !name || !email || !resumePath) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const sql = "INSERT INTO referral_requests (job_id, user_id, name, email, resume, message) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [job_id, user_id, name, email, resumePath, message], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            console.error("Database Error Details:", err.message, err.code, err.sqlMessage);
            return res.status(500).json({ error: "Database insertion failed!" });
        }
        console.log("Database insertion successful:", result);
        res.json({ message: "Referral request submitted successfully!" });
    });
});

module.exports = router;