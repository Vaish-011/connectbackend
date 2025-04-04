const express = require("express");
const db = require("../config/db");
const router = express.Router();

router.get("/:jobId", (req, res) => {
  const { jobId } = req.params;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = req.user.id;

  console.log("Fetching applications for jobId:", jobId, "and userId:", userId); // Add this line

  const sql = `
    SELECT 
      applications.*, 
      users.name AS applicant_name, 
      jobs.company AS company_name, 
      jobs.title AS job_title
    FROM applications 
    JOIN users ON applications.applicant_id = users.id
    JOIN jobs ON applications.job_id = jobs.id
    WHERE applications.job_id = ? AND jobs.user_id = ?
  `;

  db.query(sql, [jobId, userId], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Failed to fetch applications" });
    }
    console.log("Database result:", result); // Add this line
    res.json(result);
  });
});

module.exports = router;