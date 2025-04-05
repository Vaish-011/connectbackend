const express = require('express');
const db = require('../config/db');
const router = express.Router();

//route1
// Search users by name
router.post('/search', (req, res) => {
    const searchQuery = `%${req.body.query.trim()}%`; // Trim spaces and add wildcards for the LIKE query
    console.log("Search Query:", searchQuery);  // Log the raw search query

    const sql = "SELECT id, name FROM users WHERE LOWER(name) LIKE LOWER(?)";
    
    console.log("SQL Query:", sql);  // Log the query string
    console.log("Query Parameters:", searchQuery);  // Log the query parameters
    
    db.query(sql, [searchQuery], (err, results) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: err.message });
        }

        console.log("Search Results:", results);  // Log the results
        res.json(results);  // Send the results to the client
    });
});





//route 2
// Get chat list for a specific user
router.get("/getChats/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const query = `
            SELECT 
                c.id AS chat_id, 
                CASE 
                    WHEN c.user_id = ? THEN u2.id 
                    ELSE u1.id 
                END AS contact_id,
                CASE 
                    WHEN c.user_id = ? THEN u2.name 
                    ELSE u1.name 
                END AS contact_name
            FROM chat_list c
            JOIN users u1 ON c.user_id = u1.id
            JOIN users u2 ON c.contact_id = u2.id
            WHERE c.user_id = ? OR c.contact_id = ?;
        `;

        db.query(query, [userId, userId, userId, userId], (err, results) => {
            if (err) {
                console.error("Error fetching chat list:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});





//route3
router.post('/addChat', (req, res) => {
    const { user_id, contact_id } = req.body;

    if (!user_id || !contact_id) {
        return res.status(400).json({ error: "user_id and contact_id are required" });
    }

    // Check if the chat already exists
    const checkChatSQL = `
        SELECT id FROM chat_list 
        WHERE (user_id = ? AND contact_id = ?) OR (user_id = ? AND contact_id = ?);
    `;

    db.query(checkChatSQL, [user_id, contact_id, contact_id, user_id], (err, results) => {
        if (err) {
            console.error("Error checking chat:", err);
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
            // Chat already exists
            return res.json({ chat_id: results[0].id, message: "Chat already exists" });
        }

        // Insert a new chat
        const insertChatSQL = `
            INSERT INTO chat_list (user_id, contact_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;
        `;

        db.query(insertChatSQL, [user_id, contact_id], (err, result) => {
            if (err) {
                console.error("Error adding chat:", err);
                return res.status(500).json({ error: err.message });
            }

            res.json({ chat_id: result.insertId, message: "Chat added successfully!" });
        });
    });
});



//route4
router.post('/sendMessage', (req, res) => {
    const { chat_id, senderId, recipientId, message } = req.body;

    const sql = `
        INSERT INTO messages (chat_id, senderId, recipientId, message)
        VALUES (?, ?, ?, ?);
    `;

    db.query(sql, [chat_id, senderId, recipientId, message], (err, result) => {
        if (err) {
            console.error("Error sending message:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Message sent successfully!" });
    });
});


//route5
router.get('/getMessages/:chatId', (req, res) => {
    const chatId = req.params.chatId;

    const sql = `
        SELECT 
            m.id, 
            m.senderId, 
            (SELECT name FROM users WHERE id = m.senderId) AS sender_name,
            m.recipientId, 
            (SELECT name FROM users WHERE id = m.recipientId) AS recipient_name,
            m.message, 
            m.createdAt
        FROM messages m
        WHERE m.chat_id = ? 
        ORDER BY m.createdAt ASC;
    `;

    db.query(sql, [chatId], (err, results) => {
        if (err) {
            console.error("Error fetching messages:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});


module.exports = router;
