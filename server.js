require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path'); 

const app = express();
const server = http.createServer(app);
app.use('/uploads', express.static(path.join( __dirname, 'uploads')));

const io = new Server(server, {
    cors: {
        origin: "https://frontend-6a6w.onrender.com", 
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors());

app.use("/api/auth", require("./routes/authroute"));
app.use("/api/posts", require("./routes/postroute"));
app.use("/api/chat", require("./routes/chatroute"));
app.use("/api/connectionroute", require("./routes/connect"));
app.use("/api/resume",require('./routes/resumeRoutes'));
app.use("/api/tasks",require('./routes/taskroute'));
app.use("/api/feedback",require('./routes/feedbackroute'));
app.use("/api/resume", require("./routes/resumeRoutes"));
app.use('/api/user',require("./routes/userprofile"));
app.use("/api/notifications", require("./routes/notificationroute")); 
app.use("/api/jobs" , require("./routes/jobs"));
app.use("/api/application" , require("./routes/application"));
app.use("/api/leaderboard",require("./routes/leaderboardroute"));
app.use("/api/bookmarks", require ("./routes/bookmarkRoutes"));
app.use("/api/applicationReview" , require("./routes/applicationreview"))
app.use("/api/referralRequest", require("./routes/referralRoutes"));
app.use("/api/reviewReferralRequest", require("./routes/referralReview"));

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("sendMessage", (data) => {
        io.emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
