const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Pass `io` instance to use Socket.IO in routes
// module.exports = (io) => {
//   };


   // ✅ Add a new notification and emit it via Socket.IO
   router.post("/notification", (req, res) => {
    const { userId, message, type } = req.body;

    if (!userId || !message || !type) {
      return res.status(400).json({ error: "User ID, message, and type are required" });
    }

    const sql = "INSERT INTO notifications (userId, message, type) VALUES (?, ?, ?)";
    db.query(sql, [userId, message, type], (err, result) => {
      if (err) {
        console.error("Error inserting notification: ", err);
        return res.status(500).json({ error: "Database error" });
      }

      // const newNotification = { id: result.insertId, userId, message, type, createdAt: new Date(), is_read: false };

      // // Emit new notification event to frontend
      // io.emit(`notification:${userId}`, newNotification);

      res.json({ message: "Notification added successfully", id: result.insertId });
    });
  });

  // ✅ Get notifications for a user
  router.get("/notifications/:userId", (req, res) => {
    const { userId } = req.params;

    const sql = `SELECT id, message, type, createdAt, is_read FROM notifications WHERE userId = ? ORDER BY createdAt DESC`;
    
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching notifications: ", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  });

  // ✅ Mark a notification as read
  router.put("/notifications/:id/read", (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE notifications SET is_read = TRUE WHERE id = ?";
    db.query(sql, [id], (err) => {
      if (err) {
        console.error("Error updating notification status: ", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Notification marked as read" });
    });
  });

  // return router;
// };

module.exports = router;