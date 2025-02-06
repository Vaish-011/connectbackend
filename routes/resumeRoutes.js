const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST method to generate resume
router.post('/generate-resume', (req, res) => {
  const { name, email, phone, summary, experience, education, skills} = req.body;

  const query = `
    INSERT INTO resumes (name, email, phone, summary, experience, education, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, email, phone, summary, experience, education, skills], (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Error saving resume data' });
      return;
    }
    res.status(200).json({ message: 'Resume generated successfully!' });
  });
});

// GET method to fetch resume data
router.get('/getresumes', (req, res) => {
  const query = 'SELECT * FROM resumes';

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error fetching resume data' });
      return;
    }
    res.status(200).json(results); // Sends the fetched data as JSON response
  });
});

module.exports = router;
