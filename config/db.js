const mysql = require('mysql2');
require('dotenv').config();
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_name
});

db.connect((err)=>{
    if(err){
        console.log("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to MySql database.");
});
module.exports = db;