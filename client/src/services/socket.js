import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (userId) => {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000', {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (userId) {
      socket.emit('subscribe:notifications', userId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const subscribeExecution = (executionId) => {
  if (socket) socket.emit('subscribe:execution', executionId);
};

export const unsubscribeExecution = (executionId) => {
  if (socket) socket.emit('unsubscribe:execution', executionId);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
