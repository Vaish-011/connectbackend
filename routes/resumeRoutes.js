const express = require("express");
const bodyParser = require("body-parser");
const db = require("../config/db");
const router = express.Router();

router.use(bodyParser.json()); 


router.post("/submit-form", (req, res) => {
    const { name, title, contact, profile, profileText, skills, education, experience, certificates, languages } = req.body;

   
    const sqlUser = `INSERT INTO resume (name, title, profile, profileText, phone, email, linkedin, github, address)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sqlUser, [name, title, profile, profileText, contact.phone, contact.email, contact.linkedin, contact.github, contact.address], (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        const userId = result.insertId; 

      
        skills.forEach(skill => {
            db.query(`INSERT INTO skills (user_id, skill) VALUES (?, ?)`, [userId, skill]);
        });

        education.forEach(edu => {
            db.query(`INSERT INTO education (user_id, degree, institution, startYear, endYear) VALUES (?, ?, ?, ?, ?)` ,
                [userId, edu.degree, edu.institution, edu.startYear, edu.endYear]);
        });

   
        experience.forEach(exp => {
            db.query(`INSERT INTO experience (user_id, position, company, startMonth, startYear, endMonth, endYear, description)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
                [userId, exp.position, exp.company, exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.internships]);
        });

  
        certificates.forEach(cert => {
            db.query(`INSERT INTO certificates (user_id, certificate) VALUES (?, ?)`, [userId, cert]);
        });


        languages.forEach(lang => {
            db.query(`INSERT INTO languages (user_id, language) VALUES (?, ?)`, [userId, lang]);
        });

        res.status(200).send("Form submitted successfully!");
    });
});


router.get("/resume/:userId", (req, res) => {
    const userId = req.params.userId;

    const sqlUser = `SELECT * FROM resume WHERE id = ?`;

    db.query(sqlUser, [userId], (err, userResult) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (userResult.length === 0) {
            return res.status(404).send("User not found");
        }

        const userData = userResult[0];

        
        const queries = {
            skills: `SELECT skill FROM skills WHERE user_id = ?`,
            education: `SELECT degree, institution, startYear, endYear FROM education WHERE user_id = ?`,
            experience: `SELECT position, company, startMonth, startYear, endMonth, endYear, description FROM experience WHERE user_id = ?`,
            certificates: `SELECT certificate FROM certificates WHERE user_id = ?`,
            languages: `SELECT language FROM languages WHERE user_id = ?`
        };

        const results = {};

        const executeQuery = (query, key) => {
            return new Promise((resolve, reject) => {
                db.query(query, [userId], (err, result) => {
                    if (err) return reject(err);
                    results[key] = result;
                    resolve();
                });
            });
        };

        
        Promise.all([
            executeQuery(queries.skills, "skills"),
            executeQuery(queries.education, "education"),
            executeQuery(queries.experience, "experience"),
            executeQuery(queries.certificates, "certificates"),
            executeQuery(queries.languages, "languages")
        ])
            .then(() => {
                res.status(200).json({ ...userData, ...results });
            })
            .catch(error => {
                res.status(500).send(error.message);
            });
    });
});

module.exports = router;
