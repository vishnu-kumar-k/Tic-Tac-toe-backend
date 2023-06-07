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
var playersOnline = [];
var randomPlayer = [];
var team = {};
const p2p = {};
io.on("connection", (socket) => {
  console.log("A user connected");

  try {
    playersOnline.push(socket.id);
  } catch (error) {
    console.error("Error in connection:", error);
  }

  // Make Random Join
  socket.on("joinRandom", () => {
    try {
      randomPlayer.push(socket.id);

      if (randomPlayer.length < 2) {
        socket.emit("waiting");
      } else {
        var temp = `${randomPlayer[0]}%${socket.id}`;
        team[temp] = [randomPlayer.shift(), socket.id];
        var con = "X";
        var p = 1;
        io.to(team[temp][0]).emit("startGame", temp, con, p);
        con = "O";
        p = 2;
        io.to(team[temp][1]).emit("startGame", temp, con, p);

        randomPlayer = [];
      }

    } catch (error) {
      console.error("Error in joinRandom:", error);
    }
  });

  // Join With Number
  socket.on("joinWithNumber", (randomnumber) => {
    try {
      p2p[`${randomnumber}`] = socket.id;
      console.log(p2p, randomnumber);
    } catch (error) {
      console.error("Error in joinWithNumber:", error);
    }
  });


  socket.on("joinWithEnteredNumber", (number) => {
    try {
      if (p2p[number] === undefined) {
        io.to(socket.id).emit("Error", "Not Found");
      } else {
        var temp = `${p2p[number]}%${socket.id}`;
        team[temp] = [p2p[number], socket.id];
        var con = "X";
        var p = 1;
        io.to(team[temp][0]).emit("startGame", temp, con, p);
        con = "O";
        p = 2;
        io.to(team[temp][1]).emit("startGame", temp, con, p);
        p2p[number] = undefined;
      }
    } catch (error) {
      console.error("Error in joinWithEnteredNumber:", error);
      io.to(socket.id).emit("Error", "An error occurred");
    }
  });

  // Leave the Game
  socket.on("leave", (temp, player) => {
    try {
      
      if (player === 2) io.to(team[temp][0]).emit("leaveGame");
      else io.to(team[temp][1]).emit("leaveGame");
    } catch (error) {
      console.error("Error in leave:", error);
    }
  });

  // Message
  socket.on("Message", (temp, player, messaget) => {
    try {
      var m = messaget;
      if (player === 2) io.to(team[temp][0]).emit("updateMessage", m);
      else io.to(team[temp][1]).emit("updateMessage", m);
    } catch (error) {
      console.error("Error in Message:", error);
    }
  });

  // Game Board Progress
  socket.on("updateGameBoard", (newGameBoard, temp, player) => {
    try {
      if (player === 2) io.to(team[temp][0]).emit("updateGame", newGameBoard);
      else io.to(team[temp][1]).emit("updateGame", newGameBoard);
      const winner = validateGame(newGameBoard);
      console.log(winner);
      // Send the winner to the clients
      if (winner === "X") {
        io.to(team[temp][0]).emit("gameWinner", "X");
        io.to(team[temp][1]).emit("gameWinner", "X");
      } else if (winner === "O") {
        io.to(team[temp][0]).emit("gameWinner", "O");
        io.to(team[temp][1]).emit("gameWinner", "O");
      } else if (winner === "draw") {
        io.to(team[temp][0]).emit("gameWinner", "draw");
        io.to(team[temp][1]).emit("gameWinner", "draw");
      }
    } catch (error) {
      console.error("Error in updateGameBoard:", error);
    }
  });
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

function validateGame(gameBoard) {
  try {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (
        gameBoard[i][0] === gameBoard[i][1] &&
        gameBoard[i][0] === gameBoard[i][2] &&
        gameBoard[i][0] !== ""
      ) {
        return gameBoard[i][0];
      }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
      if (
        gameBoard[0][i] === gameBoard[1][i] &&
        gameBoard[0][i] === gameBoard[2][i] &&
        gameBoard[0][i] !== ""
      ) {
        return gameBoard[0][i];
      }
    }

    // Check diagonals
    if (
      (gameBoard[0][0] === gameBoard[1][1] &&
        gameBoard[0][0] === gameBoard[2][2] &&
        gameBoard[0][0] !== "") ||
      (gameBoard[0][2] === gameBoard[1][1] &&
        gameBoard[0][2] === gameBoard[2][0] &&
        gameBoard[0][2] !== "")
    ) {
      return gameBoard[1][1];
    }

    // Check for a draw
    let isDraw = true;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (gameBoard[i][j] === "") {
          isDraw = false;
          break;
        }
      }
      if (!isDraw) {
        break;
      }
    }
    if (isDraw) {
      return "draw";
    }

    // No winner yet
    return null;
  } catch (error) {
    console.error("Error in validateGame:", error);
    return null;
  }
}
