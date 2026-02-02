import { userManager } from '../utils/users.js';

/**
 * Active rooms storage
 */
const rooms = new Map();

// Initialize default room
rooms.set('general', {
  name: 'general',
  displayName: 'General',
  createdAt: new Date(),
  messages: [],
});

/**
 * Room-related socket event handlers
 */
export const setupRoomHandlers = (io, socket) => {
  /**
   * Get available rooms
   */
  socket.on('rooms:list', (callback) => {
    const roomList = Array.from(rooms.values()).map((room) => ({
      name: room.name,
      displayName: room.displayName,
      userCount: userManager.getUsersInRoom(room.name).length,
    }));
    
    callback({ success: true, rooms: roomList });
  });

  /**
   * Create a new room
   */
  socket.on('room:create', (data, callback) => {
    const { roomName, displayName } = data;
    
    if (!roomName || !displayName) {
      callback({ success: false, error: 'Room name is required' });
      return;
    }

    if (rooms.has(roomName)) {
      callback({ success: false, error: 'Room already exists' });
      return;
    }

    const room = {
      name: roomName,
      displayName,
      createdAt: new Date(),
      messages: [],
    };

    rooms.set(roomName, room);

    // Broadcast new room to all clients
    io.emit('room:created', {
      name: room.name,
      displayName: room.displayName,
      userCount: 0,
    });

    callback({ success: true, room });
  });

  /**
   * Join a room
   */
  socket.on('room:join', (data, callback) => {
    const { roomName } = data;
    const user = userManager.getUser(socket.id);

    if (!user) {
      callback({ success: false, error: 'User not found' });
      return;
    }

    if (!rooms.has(roomName)) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    // Leave current room
    const currentRoom = user.currentRoom;
    socket.leave(currentRoom);

    // Notify old room
    io.to(currentRoom).emit('user:left', {
      username: user.username,
      roomName: currentRoom,
    });

    // Join new room
    socket.join(roomName);
    userManager.updateUserRoom(socket.id, roomName);

    // Notify new room
    io.to(roomName).emit('user:joined', {
      username: user.username,
      roomName,
    });

    // Get room users
    const roomUsers = userManager.getUsersInRoom(roomName);

    // Send room history
    const room = rooms.get(roomName);
    
    callback({
      success: true,
      roomName,
      messages: room.messages.slice(-50), // Last 50 messages
      users: roomUsers.map((u) => u.username),
    });

    // Broadcast updated user counts
    io.emit('rooms:update', {
      roomName,
      userCount: roomUsers.length,
    });
  });

  /**
   * Send message to room
   */
  socket.on('message:room', (data, callback) => {
    const { roomName, content } = data;
    const user = userManager.getUser(socket.id);

    if (!user || !content) {
      callback({ success: false, error: 'Invalid message' });
      return;
    }

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: user.username,
      content,
      roomName,
      timestamp: new Date().toISOString(),
    };

    // Store message in room history
    const room = rooms.get(roomName);
    if (room) {
      room.messages.push(message);
      // Keep only last 100 messages
      if (room.messages.length > 100) {
        room.messages.shift();
      }
    }

    // Broadcast to room
    io.to(roomName).emit('message:received', message);

    // Acknowledge delivery
    callback({ success: true, messageId: message.id });
  });

  /**
   * Typing indicator for rooms
   */
  socket.on('typing:start', (data) => {
    const { roomName } = data;
    const user = userManager.getUser(socket.id);

    if (user && roomName) {
      socket.to(roomName).emit('user:typing', {
        username: user.username,
        roomName,
      });
    }
  });

  socket.on('typing:stop', (data) => {
    const { roomName } = data;
    const user = userManager.getUser(socket.id);

    if (user && roomName) {
      socket.to(roomName).emit('user:stopped-typing', {
        username: user.username,
        roomName,
      });
    }
  });
};

export { rooms };