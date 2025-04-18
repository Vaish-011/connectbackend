const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Import MySQL connection

//  Submit feedback
router.post("/feed", (req, res) => {
  const { userId, rating, message } = req.body;

  if (!userId || !rating || !message) {
    return res.status(400).json({ error: "User ID, rating, and message are required" });
  }

  const sql = "INSERT INTO feedbacks (userId, rating, message) VALUES (?, ?, ?)";
  db.query(sql, [userId, rating, message], (err, result) => {
    if (err) {
      console.error("Error inserting feedback: ", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Feedback submitted successfully", id: result.insertId });
  });
});

//  Get all feedback (with user details)
router.get("/feed", (req, res) => {
  const sql = `
    SELECT feedbacks.id, feedbacks.rating, feedbacks.message, feedbacks.createdAt,
           users.id AS userId, users.name, users.email
    FROM feedbacks
    JOIN users ON feedbacks.userId = users.id
    ORDER BY feedbacks.createdAt DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching feedback: ", err);
      return res.status(500).json({ error: "Database error" });
    }  // Debugging output
    res.json(results);
  });
});


module.exports = router;
