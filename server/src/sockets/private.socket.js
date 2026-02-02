import { userManager } from '../utils/users.js';

/**
 * Private message storage
 */
const privateMessages = new Map(); // "user1:user2" -> messages[]

/**
 * Get conversation key (consistent ordering)
 */
const getConversationKey = (user1, user2) => {
  return [user1, user2].sort().join(':');
};

/**
 * Private messaging socket event handlers
 */
export const setupPrivateMessageHandlers = (io, socket) => {
  /**
   * Send private message
   */
  socket.on('message:private', (data, callback) => {
    const { recipientUsername, content } = data;
    const sender = userManager.getUser(socket.id);

    if (!sender || !content) {
      callback({ success: false, error: 'Invalid message' });
      return;
    }

    const recipient = userManager.getUserByUsername(recipientUsername);

    if (!recipient) {
      callback({ success: false, error: 'Recipient not found' });
      return;
    }

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: sender.username,
      to: recipient.username,
      content,
      timestamp: new Date().toISOString(),
      delivered: false,
    };

    // Store message
    const conversationKey = getConversationKey(sender.username, recipient.username);
    
    if (!privateMessages.has(conversationKey)) {
      privateMessages.set(conversationKey, []);
    }

    const conversation = privateMessages.get(conversationKey);
    conversation.push(message);

    // Keep only last 100 messages per conversation
    if (conversation.length > 100) {
      conversation.shift();
    }

    // Send to recipient
    io.to(recipient.socketId).emit('message:private:received', message);

    // Mark as delivered if recipient is online
    message.delivered = true;

    // Acknowledge to sender
    callback({ 
      success: true, 
      messageId: message.id,
      delivered: true 
    });
  });

  /**
   * Get conversation history
   */
  socket.on('conversation:get', (data, callback) => {
    const { username } = data;
    const user = userManager.getUser(socket.id);

    if (!user) {
      callback({ success: false, error: 'User not found' });
      return;
    }

    const conversationKey = getConversationKey(user.username, username);
    const messages = privateMessages.get(conversationKey) || [];

    callback({
      success: true,
      messages: messages.slice(-50), // Last 50 messages
    });
  });

  /**
   * Get list of conversations (users with message history)
   */
  socket.on('conversations:list', (callback) => {
    const user = userManager.getUser(socket.id);

    if (!user) {
      callback({ success: false, error: 'User not found' });
      return;
    }

    const conversations = [];
    
    for (const [key, messages] of privateMessages.entries()) {
      const users = key.split(':');
      
      if (users.includes(user.username)) {
        const otherUser = users.find((u) => u !== user.username);
        const lastMessage = messages[messages.length - 1];
        
        conversations.push({
          username: otherUser,
          lastMessage: lastMessage?.content || '',
          timestamp: lastMessage?.timestamp || null,
          unreadCount: 0, // Could implement unread tracking
        });
      }
    }

    // Sort by most recent
    conversations.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    callback({ success: true, conversations });
  });

  /**
   * Typing indicator for private messages
   */
  socket.on('typing:private:start', (data) => {
    const { recipientUsername } = data;
    const sender = userManager.getUser(socket.id);

    if (!sender) return;

    const recipient = userManager.getUserByUsername(recipientUsername);
    
    if (recipient) {
      io.to(recipient.socketId).emit('user:typing:private', {
        username: sender.username,
      });
    }
  });

  socket.on('typing:private:stop', (data) => {
    const { recipientUsername } = data;
    const sender = userManager.getUser(socket.id);

    if (!sender) return;

    const recipient = userManager.getUserByUsername(recipientUsername);
    
    if (recipient) {
      io.to(recipient.socketId).emit('user:stopped-typing:private', {
        username: sender.username,
      });
    }
  });
};