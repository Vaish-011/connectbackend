const express = require("express");
const db = require("../config/db");

const router = express.Router();


router.post("/add", (req, res) => {
    console.log("Incoming request:", req.body); 

    const { title, company, location, skills, experience, salary, employment_type, description, apply_link , user_id} = req.body;

   
    // if (!user_id || !title || !company || !location || !skills || !experience || !salary || !employment_type || !description || !apply_link )  {
    //     return res.status(400).json({ error: "All fields are required!" });
    // }

    const validEmploymentTypes = ["Full-time", "Part-time", "Contract"];
    if (!validEmploymentTypes.includes(employment_type)) {
        return res.status(400).json({ error: "Invalid employment type!" });
    }

    const sql = "INSERT INTO jobs (title, company, location, skills, experience, salary, employment_type, description, apply_link , user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)";

    db.query(sql, [title, company, location, skills, experience, salary, employment_type, description, apply_link , user_id], (err, result) => {
        if (err) {
            console.error("Database Error:", err.code, "-", err.message);
            return res.status(500).json({ 
            error: "Database insertion failed!", 
            details: err.message 
        });
        }
        res.json({ message: "Job posted successfully!", jobId: result.insertId });
    });
});


router.get("/", (req, res) => {
    db.query("SELECT * FROM jobs", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

router.put("/update/:id", (req, res) => {
    const { id } = req.params;
    const { title, company, location, skills, experience, salary, employment_type, description, apply_link } = req.body;

    const sql = "UPDATE jobs SET title=?, company=?, location=?, skills=?, experience=?, salary=?, employment_type=?, description=?, apply_link=? WHERE id=?";
    
    db.query(sql, [title, company, location, skills, experience, salary, employment_type, description, apply_link, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Job updated successfully!" });
    });
});


router.delete("/delete/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM jobs WHERE id=?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Job deleted successfully!" });
    });
});

module.exports = router;
