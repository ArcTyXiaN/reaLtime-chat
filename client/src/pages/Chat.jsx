import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import socket from '../socket/socket';
import ChatWindow from '../components/Chat/ChatWindow';
import RoomList from '../components/Sidebar/RoomList';
import UserList from '../components/Sidebar/UserList';

const Chat = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    showSidebar,
    toggleSidebar,
    addMessage,
    addPrivateMessage,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    setTyping,
    setTypingPrivate,
    addRoom,
    setRooms,
    addNotification,
    logout,
    chatMode,
    setChatMode,
    activeConversation,
  } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Setup socket event listeners
    setupSocketListeners();

    // Fetch initial data
    fetchRooms();

    return () => {
      // Cleanup listeners
      socket.off('message:received');
      socket.off('message:private:received');
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('user:typing');
      socket.off('user:stopped-typing');
      socket.off('user:typing:private');
      socket.off('user:stopped-typing:private');
      socket.off('room:created');
      socket.off('rooms:update');
    };
  }, [isAuthenticated, navigate]);

  const setupSocketListeners = () => {
    // Room messages
    socket.on('message:received', (message) => {
      addMessage(message);
    });

    // Private messages
    socket.on('message:private:received', (message) => {
      addPrivateMessage(message);
      
      // Show notification if not in active conversation
      if (chatMode !== 'private' || activeConversation !== message.from) {
        addNotification({
          type: 'message',
          title: `New message from ${message.from}`,
          message: message.content,
        });

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Message from ${message.from}`, {
            body: message.content,
          });
        }
      }
    });

    // User online/offline
    socket.on('user:online', (data) => {
      addOnlineUser(data.username);
      addNotification({
        type: 'info',
        message: `${data.username} joined the chat`,
      });
    });

    socket.on('user:offline', (data) => {
      removeOnlineUser(data.username);
      addNotification({
        type: 'info',
        message: `${data.username} left the chat`,
      });
    });

    // Room events
    socket.on('user:joined', (data) => {
      if (data.username !== user?.username) {
        addNotification({
          type: 'info',
          message: `${data.username} joined ${data.roomName}`,
        });
      }
    });

    socket.on('user:left', (data) => {
      addNotification({
        type: 'info',
        message: `${data.username} left ${data.roomName}`,
      });
    });

    // Typing indicators
    socket.on('user:typing', (data) => {
      setTyping(data.username, data.roomName, true);
    });

    socket.on('user:stopped-typing', (data) => {
      setTyping(data.username, data.roomName, false);
    });

    socket.on('user:typing:private', (data) => {
      setTypingPrivate(data.username, true);
    });

    socket.on('user:stopped-typing:private', (data) => {
      setTypingPrivate(data.username, false);
    });

    // Room updates
    socket.on('room:created', (room) => {
      addRoom(room);
    });

    socket.on('rooms:update', (data) => {
      const rooms = useChatStore.getState().rooms;
      const updatedRooms = rooms.map(r => 
        r.name === data.roomName ? { ...r, userCount: data.userCount } : r
      );
      setRooms(updatedRooms);
    });

    // Disconnection
    socket.on('disconnect', () => {
      addNotification({
        type: 'error',
        message: 'Disconnected from server',
      });
    });

    // Reconnection
    socket.on('reconnect', () => {
      addNotification({
        type: 'success',
        message: 'Reconnected to server',
      });
    });
  };

  const fetchRooms = () => {
    socket.emit('rooms:list', (response) => {
      if (response.success) {
        setRooms(response.rooms);
      }
    });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      socket.disconnect();
      logout();
      navigate('/');
    }
  };

  const handleBackToRooms = () => {
    setChatMode('room');
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="h-screen bg-bg-main gradient-mesh flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } glass border-r border-text-muted/10 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-text-muted/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-text-primary">
              Real-time Chat
            </h2>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-error-red/20 text-error-red transition-all duration-200"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chat-sender to-accent-cyan flex items-center justify-center font-bold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-primary">{user?.username}</p>
              <div className="flex items-center gap-1.5">
                <div className="status-online" />
                <span className="text-xs text-success-green">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <RoomList />
          <div className="border-t border-text-muted/10 pt-6">
            <UserList />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="glass border-b border-text-muted/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-bg-secondary text-text-primary transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {chatMode === 'private' && (
              <button
                onClick={handleBackToRooms}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm">Back to rooms</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-success-green/20 text-success-green text-xs font-medium">
              {chatMode === 'room' ? '📢 Room' : '💬 Private'}
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <ChatWindow />
      </div>
    </div>
  );
};

export default Chat;