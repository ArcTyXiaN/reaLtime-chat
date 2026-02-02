import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import socket from '../../socket/socket';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatWindow = () => {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    user,
    currentRoom,
    messages,
    privateMessages,
    activeConversation,
    chatMode,
    typingUsers,
    typingUsersPrivate,
    rooms,
  } = useChatStore();

  // Get current messages based on chat mode
  const currentMessages = chatMode === 'room'
    ? messages[currentRoom] || []
    : privateMessages[activeConversation] || [];

  // Get typing users
  const currentTypingUsers = chatMode === 'room'
    ? typingUsers[currentRoom] || []
    : typingUsersPrivate[activeConversation] ? [activeConversation] : [];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, currentTypingUsers]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      
      if (chatMode === 'room') {
        socket.emit('typing:start', { roomName: currentRoom });
      } else {
        socket.emit('typing:private:start', { recipientUsername: activeConversation });
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      
      if (chatMode === 'room') {
        socket.emit('typing:stop', { roomName: currentRoom });
      } else {
        socket.emit('typing:private:stop', { recipientUsername: activeConversation });
      }
    }, 1000);
  };

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;

    const content = messageInput.trim();
    setMessageInput('');

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      if (chatMode === 'room') {
        socket.emit('typing:stop', { roomName: currentRoom });
      } else {
        socket.emit('typing:private:stop', { recipientUsername: activeConversation });
      }
    }

    if (chatMode === 'room') {
      // Send room message
      socket.emit('message:room', 
        { roomName: currentRoom, content },
        (response) => {
          if (!response.success) {
            console.error('Failed to send message:', response.error);
          }
        }
      );
    } else {
      // Send private message
      const tempMessage = {
        id: `temp-${Date.now()}`,
        from: user.username,
        to: activeConversation,
        content,
        timestamp: new Date().toISOString(),
        delivered: false,
      };

      useChatStore.getState().addPrivateMessage(tempMessage);

      socket.emit('message:private',
        { recipientUsername: activeConversation, content },
        (response) => {
          if (response.success) {
            // Update message with real ID and delivery status
            tempMessage.id = response.messageId;
            tempMessage.delivered = response.delivered;
          } else {
            console.error('Failed to send private message:', response.error);
          }
        }
      );
    }
  };

  // Get chat title
  const getChatTitle = () => {
    if (chatMode === 'room') {
      const room = rooms.find(r => r.name === currentRoom);
      return room?.displayName || currentRoom;
    }
    return activeConversation;
  };

  // Get chat subtitle
  const getChatSubtitle = () => {
    if (chatMode === 'room') {
      const room = rooms.find(r => r.name === currentRoom);
      return `${room?.userCount || 0} members`;
    }
    return 'Private conversation';
  };

  return (
    <div className="flex flex-col h-full bg-bg-main">
      {/* Header */}
      <div className="glass border-b border-text-muted/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-semibold text-text-primary">
              {getChatTitle()}
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              {getChatSubtitle()}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {currentMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {currentMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={
                  chatMode === 'room' 
                    ? msg.username === user?.username
                    : msg.from === user?.username
                }
              />
            ))}
          </>
        )}
        {currentTypingUsers.length > 0 && (
          <TypingIndicator usernames={currentTypingUsers} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass border-t border-text-muted/10 px-6 py-4">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            placeholder={`Message ${chatMode === 'room' ? getChatTitle() : activeConversation}...`}
            className="flex-1 input-primary"
            autoFocus
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;