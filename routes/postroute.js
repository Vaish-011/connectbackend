const express = require('express');
const db = require('../config/db');
const router = express.Router();
router.post('/post',(req,res)=>{
    const {content,userId} = req.body;
    const sql = "INSERT INTO posts (content,userId) VALUES (?,?)";
    db.query(sql,[content,userId],(err,result)=>{
        if(err) return res.status(500).json({error:err.message});
        res.status(201).json({message:'post created successfully',postId:result.insertId});
    });
});
router.get('/post',(req,res)=>{
    const sql = `SELECT posts.id, posts.content, posts.createdAt, users.name 
    FROM posts JOIN users ON posts.userId=users.id ORDER BY posts.createdAt DESC`;
    db.query(sql,(err,result)=>{
        if(err) return res.status(500).json({error:err.message});
        res.json(result);
    });
});
module.exports = router;