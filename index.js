const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const activeUsers = new Map();
const matchQueue = [];

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("join", (userInfo) => {
    activeUsers.set(socket.id, userInfo);
    matchQueue.push(socket.id);
    tryMatch();
  });

  socket.on("message", ({ to, message }) => {
    io.to(to).emit("message", { from: socket.id, message });
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.id);
    const index = matchQueue.indexOf(socket.id);
    if (index !== -1) matchQueue.splice(index, 1);
  });

  function tryMatch() {
    while (matchQueue.length >= 2) {
      const [a, b] = [matchQueue.shift(), matchQueue.shift()];
      io.to(a).emit("matched", { peer: b });
      io.to(b).emit("matched", { peer: a });
    }
  }
});

server.listen(3000, () => console.log("Server running on port 3000"));
