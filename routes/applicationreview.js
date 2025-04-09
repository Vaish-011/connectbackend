const express = require('express');
const router = express.Router();
const db = require('../config/db');


//http://localhost:5000/api/applicationReview/applicants/13

router.get("/applicants/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
      SELECT 
          applications.*, 
          users.name AS applicant_name,
          jobs.company AS company_name,
          jobs.title AS job_title,
          jobs.id AS job_id
      FROM applications
      JOIN users ON applications.applicant_id = users.id
      JOIN jobs ON applications.job_id = jobs.id
      WHERE jobs.user_id = ?
  `;

  db.query(sql, [userId], (err, result) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Failed to retrieve applicants" });
      }
      res.json(result);
  });
});


module.exports = router;