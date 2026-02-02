import { createApp } from './app.js';
import { initializeSocket } from './sockets/index.js';
import { config } from './config/env.js';

/**
 * Start the server
 */
const startServer = () => {
  const { httpServer, io } = createApp();

  // Initialize Socket.io handlers
  initializeSocket(io);

  // Start listening
  httpServer.listen(config.port, () => {
    console.log('');
    console.log('🚀 Real-time Chat Server');
    console.log('='.repeat(50));
    console.log(`📡 Server running on port ${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Client URL: ${config.clientUrl}`);
    console.log('='.repeat(50));
    console.log('');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
};

// Start the server
startServer();