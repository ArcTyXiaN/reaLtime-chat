import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/env.js';

/**
 * Create and configure Express app with Socket.io
 */
export const createApp = () => {
  const app = express();
  const httpServer = createServer(app);

  // Middleware - Allow ALL origins for testing (including file://)
  app.use(cors({
    origin: '*',
    credentials: false,
  }));

  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Basic info endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Real-time Chat Server',
      version: '1.0.0',
      status: 'running',
    });
  });

  // Initialize Socket.io - Allow ALL origins
  const io = new Server(httpServer, {
    cors: {
      origin: '*',  // ← This allows ANY origin (including null/file://)
      methods: ['GET', 'POST'],
      credentials: false,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    allowEIO3: true,  // ← Compatibility with older clients
  });

  return { app, httpServer, io };
};