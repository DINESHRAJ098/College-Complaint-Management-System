const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join a complaint room for targeted updates
    socket.on('join_complaint', (complaintId) => {
      socket.join(`complaint_${complaintId}`);
      console.log(`Socket ${socket.id} joined room complaint_${complaintId}`);
    });

    socket.on('leave_complaint', (complaintId) => {
      socket.leave(`complaint_${complaintId}`);
    });

    // Join user room for targeted notifications
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined user room user_${userId}`);
    });

    // Join role room (e.g. 'officer', 'admin')
    socket.on('join_role', (role) => {
      socket.join(`role_${role}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitComplaintCreated = (complaint) => {
  if (!io) return;
  io.emit('complaint:created', complaint);
  if (complaint.department) {
    io.to(`role_officer`).emit('complaint:department_alert', complaint);
  }
};

const emitComplaintUpdated = (complaint) => {
  if (!io) return;
  io.to(`complaint_${complaint._id}`).emit('complaint:status_updated', complaint);
  io.emit('complaint:list_updated', complaint);
};

const emitCommentAdded = (complaintId, comment) => {
  if (!io) return;
  io.to(`complaint_${complaintId}`).emit('complaint:comment_added', comment);
};

const emitNotification = (userId, notification) => {
  if (!io) return;
  io.to(`user_${userId}`).emit('notification:new', notification);
};

module.exports = {
  initSocket,
  getIO,
  emitComplaintCreated,
  emitComplaintUpdated,
  emitCommentAdded,
  emitNotification
};
