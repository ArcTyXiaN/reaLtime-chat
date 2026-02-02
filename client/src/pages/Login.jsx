import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import socket from '../socket/socket';

const Login = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser, setOnlineUsers, setConnected } = useChatStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError('');

    // Connect socket
    socket.connect();

    // Wait for connection
    socket.once('connect', () => {
      setConnected(true);

      // Login
      socket.emit('user:login', { username: username.trim() }, (response) => {
        setIsLoading(false);

        if (response.success) {
          setUser(response.user);
          setOnlineUsers(response.onlineUsers);
          navigate('/chat');
        } else {
          setError(response.error);
          socket.disconnect();
          setConnected(false);
        }
      });
    });

    // Handle connection error
    socket.once('connect_error', (err) => {
      setIsLoading(false);
      setError('Failed to connect to server. Please try again.');
      setConnected(false);
    });
  };

  return (
    <div className="min-h-screen bg-bg-main gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-chat-sender to-accent-cyan mb-4 shadow-2xl glow-cyan">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
            Real-time Chat
          </h1>
          <p className="text-text-muted">
            Connect instantly with people around the world
          </p>
        </div>

        {/* Login Form */}
        <div className="glass rounded-2xl p-8 shadow-2xl animate-slide-in">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
                Choose your username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Enter username..."
                className="w-full input-primary"
                disabled={isLoading}
                autoFocus
                maxLength={20}
              />
              {error && (
                <p className="mt-2 text-sm text-error-red animate-fade-in">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Join Chat'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-text-muted/10">
            <p className="text-xs text-text-muted text-center">
              By joining, you agree to our community guidelines
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: '⚡', text: 'Real-time' },
            { icon: '🔒', text: 'Secure' },
            { icon: '🌐', text: 'Global' },
          ].map((feature, index) => (
            <div
              key={feature.text}
              className="glass rounded-xl p-4 text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="text-xs text-text-muted">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;