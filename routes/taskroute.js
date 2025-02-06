const express = require("express");
const db = require("../config/db");
const router = express.Router();

router.post("/task" , (req, res) => {
    const {task_name , task_date , task_time , remainder,client_id} = req.body;
    const sql = "INSERT INTO tasks (task_name , task_date , task_time , remainder,client_id ) VALUES (? , ? , ? , ?,?)";

    db.query(sql , [task_name , task_date , task_time , remainder, client_id] , (err , result) => {
        if(err){
            console.error("There is a error to inserting the tasks : " , err);
            return res.status(500).json({error: "Database error"});
        }
        res.status(201).json({message : "Task added sucessfully!!" , taskId : result.insertId});
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

router.put("/task/:task_id" , (req , res) => {
    const {task_name , task_date , task_time , remainder} = req.body;
    const {task_id} = req.params;

    const sql = "UPDATE tasks SET task_name = ? , task_date = ? , task_time = ? , remainder = ? WHERE task_id = ? ";
    db.query(sql , [task_name , task_date , task_time , remainder , task_id] , (err , result) => {
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