const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messageRoutes");
const socket = require("socket.io");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Routers
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

// connect to mongodb
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch(err => {
    console.log("Connect error", err.message);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", socket => {
  global.chatSocket = socket;
  socket.on("add-user", userId => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", data => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", data.message);
    }
  });
});
