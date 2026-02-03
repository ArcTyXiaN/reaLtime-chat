import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  // User state
  user: null,
  isAuthenticated: false,
  
  // Connection state
  isConnected: false,
  
  // Rooms
  rooms: [
    { name: 'general', displayName: 'General', userCount: 0 }
  ],
  currentRoom: 'general',
  
  // Messages
  messages: {},
  
  // Private messages
  privateMessages: {},
  conversations: [],
  activeConversation: null,
  
  // Online users
  onlineUsers: [],
  
  // Typing indicators
  typingUsers: {},
  typingUsersPrivate: {},
  
  // UI state
  chatMode: 'room',
  showSidebar: true,
  notifications: [],

  // Actions
  setUser: (user) => {
    set({ user, isAuthenticated: true });
    // Save to localStorage
    localStorage.setItem('chat_user', JSON.stringify(user));
    localStorage.setItem('chat_authenticated', 'true');
  },
  
  setConnected: (status) => set({ isConnected: status }),
  
  setRooms: (rooms) => set({ rooms }),
  
  addRoom: (room) => set((state) => ({
    rooms: [...state.rooms, room]
  })),
  
  setCurrentRoom: (roomName) => set({ currentRoom: roomName }),
  
  addMessage: (message) => set((state) => {
    const roomMessages = state.messages[message.roomName] || [];
    return {
      messages: {
        ...state.messages,
        [message.roomName]: [...roomMessages, message]
      }
    };
  }),
  
  setRoomMessages: (roomName, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [roomName]: messages
    }
  })),
  
  addPrivateMessage: (message) => set((state) => {
    const conversationKey = message.from === state.user?.username 
      ? message.to 
      : message.from;
    
    const conversationMessages = state.privateMessages[conversationKey] || [];
    
    return {
      privateMessages: {
        ...state.privateMessages,
        [conversationKey]: [...conversationMessages, message]
      }
    };
  }),
  
  setPrivateMessages: (username, messages) => set((state) => ({
    privateMessages: {
      ...state.privateMessages,
      [username]: messages
    }
  })),
  
  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (username) => set({ 
    activeConversation: username,
    chatMode: 'private'
  }),
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  addOnlineUser: (username) => set((state) => ({
    onlineUsers: [...state.onlineUsers, username]
  })),
  
  removeOnlineUser: (username) => set((state) => ({
    onlineUsers: state.onlineUsers.filter(u => u !== username)
  })),
  
  setTyping: (username, roomName, isTyping) => set((state) => {
    const key = roomName || 'global';
    const typingInRoom = state.typingUsers[key] || [];
    
    if (isTyping && !typingInRoom.includes(username)) {
      return {
        typingUsers: {
          ...state.typingUsers,
          [key]: [...typingInRoom, username]
        }
      };
    } else if (!isTyping) {
      return {
        typingUsers: {
          ...state.typingUsers,
          [key]: typingInRoom.filter(u => u !== username)
        }
      };
    }
    return state;
  }),
  
  setTypingPrivate: (username, isTyping) => set((state) => {
    if (isTyping) {
      return {
        typingUsersPrivate: {
          ...state.typingUsersPrivate,
          [username]: true
        }
      };
    } else {
      const newTyping = { ...state.typingUsersPrivate };
      delete newTyping[username];
      return { typingUsersPrivate: newTyping };
    }
  }),
  
  setChatMode: (mode) => set({ chatMode: mode }),
  
  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { 
      id: Date.now(), 
      ...notification 
    }]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('chat_user');
    localStorage.removeItem('chat_authenticated');
    
    set({
      user: null,
      isAuthenticated: false,
      isConnected: false,
      currentRoom: 'general',
      messages: {},
      privateMessages: {},
      conversations: [],
      activeConversation: null,
      onlineUsers: [],
      typingUsers: {},
      typingUsersPrivate: {},
      chatMode: 'room',
      notifications: [],
    });
  },
  
  // Load user from localStorage on init
  loadFromStorage: () => {
    try {
      const savedUser = localStorage.getItem('chat_user');
      const isAuth = localStorage.getItem('chat_authenticated');
      
      if (savedUser && isAuth === 'true') {
        set({
          user: JSON.parse(savedUser),
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  },
}));

// Load from storage on app start
if (typeof window !== 'undefined') {
  useChatStore.getState().loadFromStorage();
}