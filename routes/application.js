const express = require("express");
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
// const { route } = require("./jobs");
// const { error } = require("console");

const router = express.Router();

// define where the files upload ......
const storage = multer.diskStorage({
    destination: "./uploads" , 
    filename: function(req , file , cb){
        cb(null , file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

router.post("/apply" , upload.fields([{name: "resume" , maxCount: 1} , {name: "certifications" , maxCount : 1}]) , (req , res) => {
    console.log("Request Body:", req.body);

    const {job_id , applicant_id , full_name , email , phone , linkedin , github , jobTitle , experience , expectedSalary } = req.body;

    const resume = req.files.resume ? req.files.resume[0].filename : null;

    const certifications = req.files.certifications ? req.files.certifications[0].filename : null;

    const sql = "Insert into applications (job_id , applicant_id , full_name , email , phone , linkedin , github , resume , jobTitle , experience , expectedSalary , certifications) values (? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ?)";

    db.query(sql , [job_id , applicant_id , full_name , email , phone , linkedin , github , resume  , jobTitle , experience , expectedSalary , certifications ] , (err , result) => {
        if(err) {
            console.error("Database Error:" , err);
            return res.status(500).json({error: "Application failed"});
        }
        res.json({message: "Application submitted successfully"});

    });
})

// getting the applications for a job 
router.get("/job/:jobId" , (req , res) => {
    const {jobId} = req.params;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    

    const sql = `select applicatons.* , users.name as applicant_name ,
    jobs.company as company_name,
    jobs.title as job_title 
    from applications
    join users on applications.applicant_id = users.id
    join jobs on applications.job_id = jobs.id
    where applications.job_id = ? and jobs.user_id = ?`;

    db.query(sql , [jobId , userId] , (err , result) => {
        if(err) {
            console.error("Databasse Error:" , err);
            return res.status(500).json({error: "Failed to fetch applications"});

        }
        res.json(result);
    })
})

module.exports = router;