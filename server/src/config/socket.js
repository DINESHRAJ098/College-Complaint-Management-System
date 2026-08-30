const { Server } = require('socket.io');

let io = null;

const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('subscribe:execution', (executionId) => {
      socket.join(`execution:${executionId}`);
    });

    socket.on('unsubscribe:execution', (executionId) => {
      socket.leave(`execution:${executionId}`);
    });

    socket.on('subscribe:notifications', (userId) => {
      socket.join(`notifications:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

const emitToExecution = (executionId, event, data) => {
  if (io) io.to(`execution:${executionId}`).emit(event, data);
};

const emitToUser = (userId, event, data) => {
  if (io) io.to(`notifications:${userId}`).emit(event, data);
};

module.exports = { setupSocket, getIO, emitToExecution, emitToUser };
