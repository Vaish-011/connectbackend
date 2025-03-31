const express = require("express");
const router = express.Router();
const db = require("../config/db");




// Mark a notification as read
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



//  Get pending connection requests as notifications
router.get("/notifications/:userId/pending", (req, res) => {
  const { userId } = req.params;

  const sql = `
      SELECT c.id AS connectionId, u.name AS senderName 
      FROM connections c 
      JOIN users u ON u.id = c.sender_id 
      WHERE c.receiver_id = ? AND c.status = 'pending'
  `;

  db.query(sql, [userId], (err, results) => {
      if (err) {
          console.error("Error fetching pending connections: ", err);
          return res.status(500).json({ error: "Database error" });
      }

      // Format as notifications
      const notifications = results.map(request => ({
          id: request.connectionId,
          message: `${request.senderName} sent you a connection request.`,
          type: "connection_request",
          is_read: false,
          createdAt: request.createdAt// Use actual timestamp
          
      }));

      res.json(notifications);
  });
});

//accepted
router.get("/notifications/:userId/accepted", (req, res) => {
  const { userId } = req.params;

  const sql = `
      SELECT c.id AS connectionId, u.name AS receiverName 
      FROM connections c 
      JOIN users u ON u.id = c.receiver_id 
      WHERE c.sender_id = ? AND c.status = 'accepted'
  `;

  db.query(sql, [userId], (err, results) => {
      if (err) {
          console.error("Error fetching accepted connections: ", err);
          return res.status(500).json({ error: "Database error" });
      }

      // Format as notifications
      const notifications = results.map(request => ({
          id: request.connectionId,
          message: `${request.receiverName} accepted your connection request.`,
          type: "connection_accepted",
          is_read: false,
          createdAt: request.createdAt
      }));

      res.json(notifications);
  });
});


//for posts
router.get("/notifications/:userId/posts", (req, res) => {
  const { userId } = req.params;

  const sql = `
      SELECT n.id, n.message, n.createdAt, 
             u.name AS creator_name
      FROM notifications n
      LEFT JOIN users u 
      ON u.id = SUBSTRING_INDEX(n.message, 'user ', -1) 
      WHERE n.userId = ? AND n.type = 'post_update'
      ORDER BY n.createdAt DESC
  `;

  db.query(sql, [userId], (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      // Format notifications with the extracted username
      const notifications = results.map(notification => {
          let updatedMessage = notification.message;

          // Replace "user <id>" with the actual name
          if (notification.creator_name) {
              updatedMessage = updatedMessage.replace(/user \d+/, notification.creator_name);
          }

          return {
              id: notification.id,
              message: updatedMessage,
              type: "post_update",
              is_read: false,
              createdAt: notification.createdAt
          };
      });

      res.status(200).json(notifications);
  });
});



module.exports = router;