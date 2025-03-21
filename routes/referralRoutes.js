router.post("/request", upload.single("resume"), (req, res) => {
    const { job_id, user_id, name, email, message } = req.body;
    const resumePath = req.file ? req.file.path : null; // Store resume path

    if (!job_id || !user_id || !name || !email || !resumePath) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const sql = "INSERT INTO referral_requests (job_id, user_id, name, email, resume, message) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [job_id, user_id, name, email, resumePath, message], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database insertion failed!" });
        }
        res.json({ message: "Referral request submitted successfully!" });
    });
});
