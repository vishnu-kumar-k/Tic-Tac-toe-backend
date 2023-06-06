const socketIO = require('socket.io');

function socketHandler(server) {
  const io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

module.exports = socketHandler;
