const express = require("express");
const db = require("../config/db");
const router = express.Router();

router.post("/task" , (req, res) => {
    const {task_name , task_date , task_time , remainder,client_id} = req.body;
    const formattedTaskDate = new Date(task_date).toISOString().slice(0, 19).replace('T', ' ');

    

    const sql = "INSERT INTO tasks (task_name , task_date , task_time , remainder,client_id , status) VALUES (? , ? , ? , ?,? , 'pending')";

    db.query(sql , [task_name , formattedTaskDate , task_time , remainder, client_id] , (err , result) => {
        if(err){
            console.error("There is a error to inserting the tasks : " , err);
            return res.status(500).json({error: "Database error"});
        }
        res.status(201).json({message : "Task added sucessfully!!" , taskId : result.insertId});
    });
});

router.get("/task/pending", (req, res) => {
    const sql = "SELECT * FROM tasks WHERE status = 'pending'";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching pending tasks:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  });

  router.get("/task/completed", (req, res) => {
    const sql = "SELECT * FROM tasks WHERE status = 'completed'";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching completed tasks:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  });

  router.put("/task/complete/:task_id", (req, res) => {
    const { task_id } = req.params;
    const sql = "UPDATE tasks SET status = 'completed' WHERE task_id = ?";
    db.query(sql, [task_id], (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Task marked as completed!" });
    });
  });

router.get("/task" , (req , res) => {
    const sql = "SELECT * FROM tasks";
    db.query(sql , (err , results) => {
        if(err){
            console.error("There is a error in fetching the tasks : " , err);
            return res.status(500).json({error : "Database error"});
        }
        res.json(results);
    })
})



router.get("/task/today", (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const sql = "SELECT * FROM tasks WHERE DATE(task_date) = ?";
    
    db.query(sql, [today], (err, results) => {
        if (err) {
            console.error("There is an error in fetching today's tasks: ", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

router.get("/task/upcoming", (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const sql = "SELECT * FROM tasks WHERE DATE(task_date) > ? ORDER BY task_date ASC";

    db.query(sql, [today], (err, results) => {
        if (err) {
            console.error("There is an error in fetching upcoming tasks: ", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});



router.put("/task/:task_id" , (req , res) => {
    const {task_name , task_date , task_time , remainder} = req.body;
    const {task_id} = req.params;

    const formattedTaskDate = new Date(task_date).toISOString().slice(0, 19).replace('T', ' ');

    const sql = "UPDATE tasks SET task_name = ? , task_date = ? , task_time = ? , remainder = ? WHERE task_id = ? ";
    db.query(sql , [task_name , formattedTaskDate , task_time , remainder , task_id] , (err , result) => {
        if(err){
            console.error("There is a error in updating the tasks : " , err);
            return res.status(500).json({error : "Database Error : "});
        }
        res.json({message: "Tasks Updated Successfully!!"});
    })
})

router.delete("/task/:task_id" , (req,res) => {
    const {task_id} = req.params;
    const  sql = "DELETE FROM tasks WHERE task_id  = ?";

    db.query(sql , [task_id] , (err , result) => {
        if(err){
            console.error("There is a error in deleting the tasks : " , err);
            return res.status(500).json({error : "Database Error"});
        }
        res.json({message : "Tasks deleted successfully"});
    })
})

module.exports = router;