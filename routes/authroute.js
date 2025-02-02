const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();
router.post('/register',async(req,res)=>{
try{
    const{name,email,password} = req.body;
    const hashedPassword = await bcrypt.hash(password,10);
    const sql = "INSERT INTO users (name,email,password) VALUES (?,?,?)";
    db.query(sql,[name,email,hashedPassword],(err,result)=>{
        if(err) return res.status(500).json({error: err.message});
        res.status(201).json({message:"user registered successfully", userId: result.InsertId});
    })
}
catch(error){
    res.status(500).json({error: error.message});
}
});

router.post('/login',(req,res)=>{
    const {email,password} = req.body;
    const sql = "SELECT * FROM users WHERE email=?";
    db.query(sql,[email],async(err,results)=>{
        if(err) return res.status(500).json({error:err.message});
        if(results.length===0) return res.status(401).json({message:"Invalid email or password"});
        const user = results[0];
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(401).json("Invalid username or password");
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h"});
        res.json({ message: "Login successful", token });
    });
});
module.exports = router;