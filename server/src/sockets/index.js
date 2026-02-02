import { userManager } from '../utils/users.js';
import { setupRoomHandlers } from './room.socket.js';
import { setupPrivateMessageHandlers } from './private.socket.js';

/**
 * Initialize Socket.io with all event handlers
 */
export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    /**
     * User Authentication / Login
     */
    socket.on('user:login', (data, callback) => {
      const { username } = data;

      if (!username || username.trim().length === 0) {
        callback({ success: false, error: 'Username is required' });
        return;
      }

      const trimmedUsername = username.trim();

      if (userManager.isUsernameTaken(trimmedUsername)) {
        callback({ success: false, error: 'Username is already taken' });
        return;
      }

      // Add user
      const user = userManager.addUser(socket.id, trimmedUsername);

      // Join default room
      socket.join('general');

      // Broadcast to all clients
      io.emit('user:online', {
        username: user.username,
        joinedAt: user.joinedAt,
      });

      // Notify room
      io.to('general').emit('user:joined', {
        username: user.username,
        roomName: 'general',
      });

      // Get all online users
      const onlineUsers = userManager.getAllUsers().map((u) => u.username);

      callback({
        success: true,
        user: {
          username: user.username,
          currentRoom: user.currentRoom,
        },
        onlineUsers,
      });

      console.log(`👤 User logged in: ${trimmedUsername}`);
    });

    /**
     * Setup room handlers
     */
    setupRoomHandlers(io, socket);

    /**
     * Setup private message handlers
     */
    setupPrivateMessageHandlers(io, socket);

    /**
     * Get online users
     */
    socket.on('users:online', (callback) => {
      const onlineUsers = userManager.getAllUsers().map((u) => ({
        username: u.username,
        currentRoom: u.currentRoom,
      }));

      callback({ success: true, users: onlineUsers });
    });

    /**
     * Disconnect
     */
    socket.on('disconnect', () => {
      const user = userManager.removeUser(socket.id);

      if (user) {
        // Broadcast to all clients
        io.emit('user:offline', {
          username: user.username,
        });

        // Notify room
        io.to(user.currentRoom).emit('user:left', {
          username: user.username,
          roomName: user.currentRoom,
        });

        console.log(`👋 User disconnected: ${user.username}`);
      }

      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialized');
};