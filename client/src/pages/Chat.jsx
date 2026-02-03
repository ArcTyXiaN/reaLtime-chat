import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import socket from '../socket/socket';
import ChatWindow from '../components/chat/ChatWindow';
import RoomList from '../components/sidebar/RoomList';
import UserList from '../components/sidebar/UserList';

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
    setConnected,
  } = useChatStore();

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Auto-reconnect on page load
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }

    // Reconnect socket if not connected
    if (!socket.connected) {
      socket.connect();
      
      socket.once('connect', () => {
        setConnected(true);
        
        // Re-login with stored username
        socket.emit('user:login', { username: user.username }, (response) => {
          if (response.success) {
            setOnlineUsers(response.onlineUsers);
            
            // Rejoin current room
            socket.emit('room:join', { roomName: 'general' }, (res) => {
              if (res.success) {
                console.log('Rejoined room after reconnect');
              }
            });
          } else {
            // If login fails, logout
            logout();
            navigate('/');
          }
        });
      });
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
    socket.on('message:received', (message) => {
      addMessage(message);
    });

    socket.on('message:private:received', (message) => {
      addPrivateMessage(message);
      
      if (chatMode !== 'private' || activeConversation !== message.from) {
        addNotification({
          type: 'message',
          title: `New message from ${message.from}`,
          message: message.content,
        });

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Message from ${message.from}`, {
            body: message.content,
          });
        }
      }
    });

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

    socket.on('disconnect', () => {
      addNotification({
        type: 'error',
        message: 'Disconnected from server',
      });
      setConnected(false);
    });

    socket.on('reconnect', () => {
      addNotification({
        type: 'success',
        message: 'Reconnected to server',
      });
      setConnected(true);
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

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="h-screen bg-bg-secondary flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } hidden md:flex card border-r border-border transition-all duration-300 overflow-hidden flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">
              Chat
            </h2>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-bg-secondary text-error transition-all duration-200"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary truncate">{user?.username}</p>
              <div className="flex items-center gap-1.5">
                <div className="status-online" />
                <span className="text-xs text-success">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <RoomList />
          <div className="border-t border-border pt-6">
            <UserList />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  Chat
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-bg-secondary text-error transition-all duration-200"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-lg hover:bg-bg-secondary text-text-primary"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{user?.username}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="status-online" />
                    <span className="text-xs text-success">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <RoomList />
              <div className="border-t border-border pt-6">
                <UserList />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                toggleSidebar(); // Desktop
                setShowMobileMenu(true); // Mobile
              }}
              className="p-2 rounded-lg hover:bg-bg-secondary text-text-primary transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {chatMode === 'private' && (
              <button
                onClick={handleBackToRooms}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm hidden sm:inline">Back to rooms</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
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