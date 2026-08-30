const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PORT, CLIENT_URL } = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { seedDatabase } = require('./services/seedService');
const errorHandler = require('./middlewares/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server, CLIENT_URL);

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'College Complaint & Grievance Management System (CampusResolve)',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    server.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🎓 CampusResolve Server running on http://localhost:${PORT}`);
      console.log(`🚀 Real-time Socket.IO enabled`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Fatal Server Initialization Error:', err);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
