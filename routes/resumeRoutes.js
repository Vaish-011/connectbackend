const express = require("express");
const bodyParser = require("body-parser");
const db = require('../config/db');
const router = express.Router();


// Endpoint to handle form submission
router.post("/submit-form", (req, res) => {
    const { name, title, contact, profile, profileText, skills, education, experience, certificates, languages } = req.body;

    // Insert user personal info
    const sqlUser = `INSERT INTO resume (name, title, profile, profileText, phone, email, linkedin, github, address)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sqlUser, [name, title, profile, profileText, contact.phone, contact.email, contact.linkedin, contact.github, contact.address], (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        const userId = result.id;

        // Insert skills
        skills.forEach(skill => {
            db.query(`INSERT INTO skills (user_id, skill) VALUES (?, ?)`, [userId, skill]);
        });

        // Insert education
        education.forEach(edu => {
            db.query(`INSERT INTO education (user_id, degree, institution, startYear, endYear) VALUES (?, ?, ?, ?, ?)`,
                [userId, edu.degree, edu.institution, edu.startYear, edu.endYear]);
        });

        // Insert experience
        experience.forEach(exp => {
            db.query(`INSERT INTO experience (user_id, position, company, startMonth, startYear, endMonth, endYear, description)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, exp.position, exp.company, exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.internships]);
        });

        // Insert certificates
        certificates.forEach(cert => {
            db.query(`INSERT INTO certificates (user_id, certificate) VALUES (?, ?)`, [userId, cert]);
        });

        // Insert languages
        languages.forEach(lang => {
            db.query(`INSERT INTO languages (user_id, language) VALUES (?, ?)`, [userId, lang]);
        });

        res.status(200).send("Form submitted successfully!");
    });
});

module.exports = router;