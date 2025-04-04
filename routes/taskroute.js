// Importing the required modules.........

const express = require("express");
const db = require("../config/db");
const router = express.Router();

// for create a new task 
router.post("/task" , (req, res) => {
    const {task_name , task_date , task_time , remainder,client_id} = req.body;

    if (!client_id) {
        return res.status(400).json({ error: "Client ID is required" });
    }
    const utcDate = new Date(task_date); 
    const formattedTaskDate = utcDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const sql = "INSERT INTO tasks (task_name , task_date , task_time , remainder,client_id , status) VALUES (? , ? , ? , ?, ? , 'pending')";

    db.query(sql , [task_name , formattedTaskDate , task_time , remainder, client_id] , (err , result) => {
        if(err){
            console.error("There is a error to inserting the tasks : " , err);
            return res.status(500).json({error: "Database error"});
        }
        res.status(201).json({message : "Task added sucessfully!!" , taskId : result.insertId});
    });
});

// get all tasks of a particular client......

router.get("/task/:client_id", (req, res) => {
    const { client_id } = req.params;
    const sql = "SELECT * FROM tasks WHERE client_id = ?";
    
    db.query(sql, [client_id], (err, results) => {
        if (err) {
            console.error("Error fetching tasks:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// getting pending tasks for the specific client........

router.get("/task/pending/:client_id", (req, res) => {
    const { client_id } = req.params;
    if (!client_id) {
        return res.status(400).json({ error: "Client ID is required" });
    }
    const sql = "SELECT * FROM tasks WHERE status = 'pending' AND client_id = ?";
    db.query(sql,  [client_id] , (err, results) => {
      if (err) {
        console.error("Error fetching pending tasks:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  });

  // getting the completed tasks for the particular client.....

  router.get("/task/completed/:client_id", (req, res) => {
    const { client_id } = req.params;
    if (!client_id) {
        return res.status(400).json({ error: "Client ID is required" });
    }
    const sql = "SELECT * FROM tasks WHERE status = 'completed' AND client_id = ?";
    db.query(sql, [client_id], (err, results) => {
      if (err) {
        console.error("Error fetching completed tasks:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  });
  
  // modify the tasks status
  router.put("/task/complete/:task_id", (req, res) => {
    const { task_id } = req.params;
    const { client_id } = req.body;

    if (!client_id) {
        return res.status(400).json({ error: "Client ID is required" });
    }

    const sql = "UPDATE tasks SET status = 'completed' WHERE task_id = ? AND client_id = ?";
    db.query(sql, [task_id , client_id], (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Task not found or unauthorized" });
    }
      res.json({ message: "Task marked as completed!" });
    });
  });


// getting todays tasks for a specific client

router.get("/task/today/:client_id", (req, res) => {
    const { client_id } = req.params;
    if (!client_id) {
        return res.status(400).json({ error: "Client ID is required" });
    }
    const sql = `SELECT * FROM tasks WHERE DATE(CONVERT_TZ(task_date, '+00:00', '+05:30')) = CURDATE() AND client_id = ?`;

    db.query(sql, [client_id], (err, results) => {
        if (err) {
            console.error("Error fetching today's tasks:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// getting the upcoming tasks for specific client.....

router.get("/task/upcoming/:client_id", (req, res) => {
    const { client_id } = req.params;

    if (!client_id) {
        return res.status(400).json({ error: "Client ID is required" });
    }
    const sql = "SELECT * FROM tasks WHERE DATE(CONVERT_TZ(task_date, '+00:00', '+05:30')) > CURDATE() AND client_id = ? ORDER BY task_date ASC";

    db.query(sql, [client_id], (err, results) => {
        if (err) {
            console.error("There is an error in fetching upcoming tasks: ", err);
            return res.status(500).json({ error: "Database error" });
        }
        console.log("Fetched Upcoming Tasks:", results);
        res.json(results);
    });
});

// edit a task 

router.put("/task/:task_id" , (req , res) => {
    const {task_name , task_date , task_time , remainder , client_id} = req.body;
    const {task_id} = req.params;

    if (!client_id) {
        return res.status(400).json({ error: "Client ID is required" });
    }

    const formattedTaskDate = new Date(task_date).toISOString().split('T')[0];

    const sql = `UPDATE tasks SET task_name = ? , task_date = ? , task_time = ? , remainder = ? WHERE task_id = ? AND client_id = ?`;
    db.query(sql , [task_name , formattedTaskDate , task_time , remainder , task_id , client_id] , (err , result) => {
        if(err){
            console.error("There is a error in updating the tasks : " , err);
            return res.status(500).json({error : "Database Error : "});
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found or unauthorized" });
        }
        res.json({message: "Tasks Updated Successfully!!"});
    })
})

// deleting a tasks.....

router.delete("/task/:task_id" , (req,res) => {
    const {task_id} = req.params;
    const { client_id } = req.body;

    if (!client_id) {
        return res.status(400).json({ error: "Client ID is required" });
    }

    const  sql = `DELETE FROM tasks WHERE task_id  = ? AND client_id = ?`;

    db.query(sql , [task_id , client_id] , (err , result) => {
        if(err){
            console.error("There is a error in deleting the tasks : " , err);
            return res.status(500).json({error : "Database Error"});
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found or unauthorized" });
        }
        res.json({message : "Tasks deleted successfully"});
    })
})

// task notification part 

router.get("/task/notifications/:client_id", (req, res) => {
    const { client_id } = req.params;
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }); // Format as HH:MM

    const sql = `
        SELECT * FROM tasks 
        WHERE DATE(CONVERT_TZ(task_date, '+00:00', '+05:30')) = CURDATE() 
        AND task_time <= ? 
        AND client_id = ? 
        ORDER BY task_time ASC`;

    db.query(sql, [currentTime, client_id], (err, results) => {
        if (err) {
            console.error("Error fetching notifications: ", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

module.exports = router;