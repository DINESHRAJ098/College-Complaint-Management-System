import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Real-time Grievance Socket:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Real-time Socket');
    });
  }

  return socket;
};

export const joinComplaintRoom = (complaintId) => {
  const s = getSocket();
  if (s && complaintId) {
    s.emit('join_complaint', complaintId);
  }
};

export const leaveComplaintRoom = (complaintId) => {
  const s = getSocket();
  if (s && complaintId) {
    s.emit('leave_complaint', complaintId);
  }
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  if (s && userId) {
    s.emit('join_user', userId);
  }
};

export const joinRoleRoom = (role) => {
  const s = getSocket();
  if (s && role) {
    s.emit('join_role', role);
  }
};
