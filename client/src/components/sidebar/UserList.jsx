import { useChatStore } from '../../store/chatStore';
import socket from '../../socket/socket';

const UserList = () => {
  const { 
    user,
    onlineUsers, 
    activeConversation,
    setActiveConversation,
    setPrivateMessages,
    setChatMode,
  } = useChatStore();

  const handleStartConversation = (username) => {
    if (username === user?.username) return;

    // Fetch conversation history
    socket.emit('conversation:get', { username }, (response) => {
      if (response.success) {
        setPrivateMessages(username, response.messages);
        setActiveConversation(username);
        setChatMode('private');
      }
    });
  };

  const filteredUsers = onlineUsers.filter(u => u !== user?.username);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-display font-semibold text-text-muted uppercase tracking-wider mb-4">
        Online Users ({filteredUsers.length})
      </h3>

      {filteredUsers.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4">
          No other users online
        </p>
      ) : (
        <div className="space-y-1">
          {filteredUsers.map((username) => (
            <button
              key={username}
              onClick={() => handleStartConversation(username)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                activeConversation === username
                  ? 'bg-accent-cyan/20 text-accent-cyan shadow-lg glow-cyan'
                  : 'hover:bg-bg-secondary text-text-primary'
              }`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chat-sender to-accent-cyan flex items-center justify-center font-semibold text-sm text-white">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 status-online ring-2 ring-bg-secondary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{username}</p>
                <p className="text-xs text-text-muted">Online</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;