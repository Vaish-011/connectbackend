const express = require('express');
const db = require('../config/db');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Store in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get file extension
        const filename = Date.now() + ext; // Create a unique filename
        cb(null, filename);
    }
});

const upload = multer({ storage });

// Route to update profile photo
router.put('/update-profile-photo/:userId', upload.single('profile_photo'), (req, res) => {
    const userId = req.params.userId;
    
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const profilePhotoPath = req.file.path; 

    // Update the profile_photo field in the userProfile table
    const sql = `UPDATE userProfile SET profile_photo = ? WHERE user_id = ?`;

    db.query(sql, [profilePhotoPath, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Profile photo updated successfully", profile_photo: profilePhotoPath });
    });
});

router.get('/get-profile-photo/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = `SELECT profile_photo FROM userProfile WHERE user_id = ?`;

    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ profile_photo: result[0].profile_photo });
    });
});

// Add or update profile
router.post('/add_profile', (req, res) => {
    const { user_id, name, email, phone, profile_photo, summary } = req.body;
    const checkProfileSql = `SELECT * FROM userProfile WHERE user_id = ?`;

    db.query(checkProfileSql, [user_id], (err, result) => {
        if (err) {
            console.error('Error checking profile:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (result.length > 0) {
            // Update profile
            const sql = `UPDATE userProfile SET name = ?, email = ?, phone = ? summary = ? WHERE user_id = ?`;
            db.query(sql, [name, email, phone, summary, user_id], (err, updateResult) => {
                if (err) {
                    console.error('Error updating profile:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(200).json({ message: 'Profile updated successfully' });
            });
        } else {
            // Insert new profile
            const sql = `INSERT INTO userProfile (user_id, name, email, phone, profile_photo, summary) VALUES (?, ?, ?, ?, ?, ?)`;
            db.query(sql, [user_id, name, email, phone, profile_photo, summary], (err, insertResult) => {
                if (err) {
                    console.error('Error inserting profile:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(201).json({ message: 'Profile added successfully', profileId: insertResult.insertId });
            });
        }
    });
});

// Update profile photo
// router.post('/update_profile_photo', upload.single('profile_photo'), (req, res) => {
//     const { user_id } = req.body;

//     if (!req.file) {
//         console.error("File upload failed.");
//         return res.status(400).json({ message: "No file uploaded" });
//     }

//     const profile_photo = `/uploads/${req.file.filename}`;

//     const sql = `SELECT * FROM userProfile WHERE user_id = ?`;
//     db.query(sql, [user_id], (err, result) => {
//         if (err) {
//             console.error('Error checking profile:', err);
//             return res.status(500).json({ message: 'Database error', error: err });
//         }

//         if (result.length === 0) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Update profile photo
//         const updateSql = `UPDATE userProfile SET profile_photo = ? WHERE user_id = ?`;
//         db.query(updateSql, [profile_photo, user_id], (err, updateResult) => {
//             if (err) {
//                 console.error('Error updating profile photo:', err);
//                 return res.status(500).json({ message: 'Database error', error: err });
//             }
//             res.status(200).json({ message: 'Profile photo updated successfully', profile_photo });
//         });
//     });
// });

// Add or update license
router.post('/add_license', (req, res) => {
    const { user_id, title, issuing_organization, issue_date, expiration_date, credential_id, credential_url } = req.body;

    const checkLicenseSql = `SELECT * FROM licenses_certificates WHERE user_id = ? AND credential_id = ?`;
    db.query(checkLicenseSql, [user_id, credential_id], (err, result) => {
        if (err) {
            console.error('Error checking license:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
            // Insert new license
            const sql = `INSERT INTO licenses_certificates (user_id, title, issuing_organization, issue_date, expiration_date, credential_id, credential_url) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.query(sql, [user_id, title, issuing_organization, issue_date, expiration_date, credential_id, credential_url], (err, insertResult) => {
                if (err) {
                    console.error('Error inserting license:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(201).json({ message: 'License added successfully', licenseId: insertResult.insertId });
            });
        
    });
});

// Add or update experience
router.post('/add_experience', (req, res) => {
    const { user_id, job_title, company, start_date, end_date, description } = req.body;

    const checkExperienceSql = `SELECT * FROM experiencesProfile WHERE user_id = ? AND job_title = ? AND company = ?`;
    db.query(checkExperienceSql, [user_id, job_title, company], (err, result) => {
        if (err) {
            console.error('Error checking experience:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (result.length > 0) {
            // Update experience
            const sql = `UPDATE experiencesProfile SET start_date = ?, end_date = ?, description = ? WHERE user_id = ? AND job_title = ? AND company = ?`;
            db.query(sql, [start_date, end_date, description, user_id, job_title, company], (err, updateResult) => {
                if (err) {
                    console.error('Error updating experience:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(200).json({ message: 'Experience updated successfully' });
            });
        } else {
            // Insert new experience
            const sql = `INSERT INTO experiencesProfile (user_id, job_title, company, start_date, end_date, description) 
                         VALUES (?, ?, ?, ?, ?, ?)`;
            db.query(sql, [user_id, job_title, company, start_date, end_date, description], (err, insertResult) => {
                if (err) {
                    console.error('Error inserting experience:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(201).json({ message: 'Experience added successfully', experienceId: insertResult.insertId });
            });
        }
    });
});

// Add or update education
router.post('/add_education', (req, res) => {
    const { user_id, institution, degree, field_of_study, start_year, end_year } = req.body;

    const checkEducationSql = `SELECT * FROM educationProfile WHERE user_id = ? AND institution = ? AND degree = ?`;
    db.query(checkEducationSql, [user_id, institution, degree], (err, result) => {
        if (err) {
            console.error('Error checking education:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

    
            // Insert new education
            const sql = `INSERT INTO educationProfile (user_id, institution, degree, field_of_study, start_year, end_year) 
                         VALUES (?, ?, ?, ?, ?, ?)`;
            db.query(sql, [user_id, institution, degree, field_of_study, start_year, end_year], (err, insertResult) => {
                if (err) {
                    console.error('Error inserting education:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(201).json({ message: 'Education added successfully', educationId: insertResult.insertId });
            });
    });
});

// Add or update skill
router.post('/add_skill', (req, res) => {
    const { user_id, skill_name } = req.body;

    const checkSkillSql = `SELECT * FROM skillsProfile WHERE user_id = ? AND skill_name = ?`;
    db.query(checkSkillSql, [user_id, skill_name], (err, result) => {
        if (err) {
            console.error('Error checking skill:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (result.length > 0) {
            // Update skill
            const sql = `UPDATE skillsProfile SET skill_name = ? WHERE user_id = ? AND skill_name = ?`;
            db.query(sql, [skill_name, user_id, skill_name], (err, updateResult) => {
                if (err) {
                    console.error('Error updating skill:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(200).json({ message: 'Skill updated successfully' });
            });
        } else {
            // Insert new skill
            const sql = `INSERT INTO skillsProfile (user_id, skill_name) VALUES (?, ?)`;
            db.query(sql, [user_id, skill_name], (err, insertResult) => {
                if (err) {
                    console.error('Error inserting skill:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(201).json({ message: 'Skill added successfully', skillId: insertResult.insertId });
            });
        }
    });
});

// Add or update interest
router.post('/add_interest', (req, res) => {
    const { user_id, interest_name } = req.body;

    const checkInterestSql = `SELECT * FROM interestsProfile WHERE user_id = ? AND interest_name = ?`;
    db.query(checkInterestSql, [user_id, interest_name], (err, result) => {
        if (err) {
            console.error('Error checking interest:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (result.length > 0) {
            // Update interest
            const sql = `UPDATE interestsProfile SET interest_name = ? WHERE user_id = ? AND interest_name = ?`;
            db.query(sql, [interest_name, user_id, interest_name], (err, updateResult) => {
                if (err) {
                    console.error('Error updating interest:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(200).json({ message: 'Interest updated successfully' });
            });
        } else {
            // Insert new interest
            const sql = `INSERT INTO interestsProfile (user_id, interest_name) VALUES (?, ?)`;
            db.query(sql, [user_id, interest_name], (err, insertResult) => {
                if (err) {
                    console.error('Error inserting interest:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(201).json({ message: 'Interest added successfully', interestId: insertResult.insertId });
            });
        }
    });
});

//  Get user profile photo by user_id
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

//  Get user profile by user_id
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

// Get all licenses/certificates by user_id
router.get('/get_licenses/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM licenses_certificates WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(result);
    });
});


// Get all experiences by user_id
router.get('/get_experiences/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM experiencesProfile WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(result);
    });
});



//  Get all education details by user_id
router.get('/get_education/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM educationProfile WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(result);
    });
});



//  Get all skills by user_id
router.get('/get_skills/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM skillsProfile WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(result);
    });
});


//  Get all interests by user_id
router.get('/get_interests/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM interestsProfile WHERE user_id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(result);
    });
});

module.exports = router;

