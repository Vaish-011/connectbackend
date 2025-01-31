require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
app.use("/api/auth", require("./routes/authroute"));
app.use("/api/posts", require("./routes/postroute"));

app.listen(5000, () => console.log(`Server running on port 5000`));