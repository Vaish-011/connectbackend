const express = require('express');
const db = require('../config/db');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
// ✅ Add user profile details
router.post('/add_profile', (req, res) => {
    const { user_id, name, email, phone, profile_photo, summary } = req.body;
    const sql = `INSERT INTO userProfile (user_id, name, email, phone, profile_photo, summary) VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [user_id, name, email, phone, profile_photo, summary], (err, result) => {
        if (err) {
            console.error('Error inserting profile:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.status(201).json({ message: 'Profile added successfully', profileId: result.insertId });
    });
});
// Ensure the "uploads" directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Store uploads in a local directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get file extension
        const filename = Date.now() + ext; // Create a unique filename
        cb(null, filename);
    }
});

// Multer upload instance with limits and file type validation
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'), false);
        }
        cb(null, true);
    }
});


// ✅ Update profile photo
router.post('/update_profile_photo', upload.single('profile_photo'), (req, res) => {
    const { user_id } = req.body;

    if (!req.file) {
        console.error("File upload failed.");
        return res.status(400).json({ message: "No file uploaded" });
    }

    const profile_photo = `/uploads/${req.file.filename}`;

    console.log(`Updating profile photo for user_id: ${user_id}, File: ${profile_photo}`);

    const sql = `UPDATE userProfile SET profile_photo = ? WHERE user_id = ?`;

    db.query(sql, [profile_photo, user_id], (err, result) => {
        if (err) {
            console.error('Error updating profile photo:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Profile photo updated successfully', profile_photo });
    });
});


// ✅ Get user profile photo by user_id
router.get("/get_profile_photo/:user_id", (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT profile_photo FROM userProfile WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.length === 0 || !result[0].profile_photo) {
            return res.status(404).json({ message: "Profile photo not found" });
        }

        res.status(200).json({ profile_photo: result[0].profile_photo });
    });
});

// ✅ Get user profile by user_id
router.get("/get_profile/:user_id", (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM userProfile WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(result[0]); // Send first user object instead of array
    });
});
// ✅ Add license/certificate
router.post('/add_license', (req, res) => {
    const { user_id, title, issuing_organization, issue_date, expiration_date, credential_id, credential_url } = req.body;
    const sql = `INSERT INTO licenses_certificates (user_id, title, issuing_organization, issue_date, expiration_date, credential_id, credential_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [user_id, title, issuing_organization, issue_date, expiration_date, credential_id, credential_url], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(201).json({ message: 'License/Certificate added successfully', licenseId: result.insertId });
    });
});

// ✅ Get all licenses/certificates by user_id
router.get('/get_licenses/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM licenses_certificates WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(result);
    });
});

// ✅ Add experience
router.post('/add_experience', (req, res) => {
    const { user_id, job_title, company, start_date, end_date, description } = req.body;
    const sql = `INSERT INTO experiencesProfile (user_id, job_title, company, start_date, end_date, description) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [user_id, job_title, company, start_date, end_date, description], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(201).json({ message: 'Experience added successfully', experienceId: result.insertId });
    });
});

// ✅ Get all experiences by user_id
router.get('/get_experiences/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM experiencesProfile WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(result);
    });
});

// ✅ Add education
router.post('/add_education', (req, res) => {
    const { user_id, institution, degree, field_of_study, start_year, end_year } = req.body;
    const sql = `INSERT INTO educationProfile (user_id, institution, degree, field_of_study, start_year, end_year) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [user_id, institution, degree, field_of_study, start_year, end_year], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(201).json({ message: 'Education added successfully', educationId: result.insertId });
    });
});

// ✅ Get all education details by user_id
router.get('/get_education/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM educationProfile WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(result);
    });
});

// ✅ Add skill
router.post('/add_skill', (req, res) => {
    const { user_id, skill_name } = req.body;
    const sql = `INSERT INTO skillsProfile (user_id, skill_name) VALUES (?, ?)`;

    db.query(sql, [user_id, skill_name], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(201).json({ message: 'Skill added successfully', skillId: result.insertId });
    });
});

// ✅ Get all skills by user_id
router.get('/get_skills/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM skillsProfile WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(result);
    });
});

// ✅ Add interest
router.post('/add_interest', (req, res) => {
    const { user_id, interest_name } = req.body;
    const sql = `INSERT INTO interestsProfile (user_id, interest_name) VALUES (?, ?)`;

    db.query(sql, [user_id, interest_name], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(201).json({ message: 'Interest added successfully', interestId: result.insertId });
    });
});

// ✅ Get all interests by user_id
router.get('/get_interests/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM interestsProfile WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(result);
    });
});

module.exports = router;
