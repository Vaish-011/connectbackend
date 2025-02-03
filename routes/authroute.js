const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// Register Route - Creates a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if the user already exists
        const checkUserSql = "SELECT * FROM users WHERE email=?";
        db.query(checkUserSql, [email], async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            if (results.length > 0) {
                return res.status(400).json({ message: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
            db.query(sql, [name, email, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: "User registered successfully", userId: result.insertId });
            });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login Route - Authenticates user and generates JWT token
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    const sql = "SELECT * FROM users WHERE email=?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: "Invalid email or password" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

        // Create JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        
        res.json({
            message: "Login successful",
            token,
            userId: user.id,
            name: user.name
        });
    });
});

// Middleware for verifying JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header

    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded user data to request
        next(); // Continue to the next middleware/route handler
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};

// Example of a protected route (add this to protect other routes)
router.get('/profile', verifyToken, (req, res) => {
    const sql = "SELECT name, email FROM users WHERE id=?";
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });

        res.json({
            user: results[0]
        });
    });
});

module.exports = router;
