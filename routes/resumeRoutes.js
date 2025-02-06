// /backend/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/generate-resume', (req, res) => {
  const { name, contact, objective, education, experience, skills, projects, certifications, languages } = req.body;

  const query = `
    INSERT INTO resumes (name, contact, objective, education, experience, skills, projects, certifications, languages)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, contact, objective, education, experience, skills, projects, certifications, languages], (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Error saving resume data' });
      return;
    }
    res.status(200).json({ message: 'Resume generated successfully!' });
  });
});

module.exports = router;