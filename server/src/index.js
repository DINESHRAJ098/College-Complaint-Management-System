const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { setupSocket } = require('./config/socket');
const { initQueue, processQueue, addJob } = require('./queues/executionQueue');
const env = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const orchestrator = require('./agents/orchestrator');

const app = express();
const httpServer = http.createServer(app);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later' },
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    langGraph: orchestrator.langGraphAvailable ? 'available' : 'not-installed',
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Start
const start = async () => {
  await connectDB();
  await initQueue();
  setupSocket(httpServer);

  // Process execution queue
  processQueue(async (data) => {
    if (data.executionId) {
      await orchestrator.run(data.executionId).catch((err) => console.error('Queue execution error:', err.message));
    }
  });

  const PORT = env.PORT || 5000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Agentflow AI server running on port ${PORT}`);
  });
};

start().catch(console.error);

module.exports = app;
