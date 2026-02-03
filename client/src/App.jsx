import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useChatStore } from './store/chatStore';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './styles/theme.css';

function App() {
  const { isAuthenticated, loadFromStorage } = useChatStore();

  useEffect(() => {
    // Load user from localStorage on app mount
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/chat"
          element={isAuthenticated ? <Chat /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;