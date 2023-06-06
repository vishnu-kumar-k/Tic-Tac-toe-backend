const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
var playersOnline=[]
io.on("connection", (socket) => {
  console.log("A user connected");
    playersOnline.push(socket.id)
    
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
