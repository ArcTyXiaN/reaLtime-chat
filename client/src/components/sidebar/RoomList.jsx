import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import socket from '../../socket/socket';

const RoomList = () => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDisplay, setNewRoomDisplay] = useState('');

  const { rooms, currentRoom, setCurrentRoom, addRoom, setChatMode, setRoomMessages } = useChatStore();

  const handleJoinRoom = (roomName) => {
    if (roomName === currentRoom) return;

    socket.emit('room:join', { roomName }, (response) => {
      if (response.success) {
        setCurrentRoom(roomName);
        setChatMode('room');
        setRoomMessages(roomName, response.messages);
      } else {
        console.error('Failed to join room:', response.error);
      }
    });
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    
    if (!newRoomName.trim() || !newRoomDisplay.trim()) return;

    const roomName = newRoomName.trim().toLowerCase().replace(/\s+/g, '-');
    const displayName = newRoomDisplay.trim();

    socket.emit('room:create', 
      { roomName, displayName },
      (response) => {
        if (response.success) {
          addRoom(response.room);
          setShowCreateRoom(false);
          setNewRoomName('');
          setNewRoomDisplay('');
          handleJoinRoom(roomName);
        } else {
          alert(response.error);
        }
      }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Rooms
        </h3>
        <button
          onClick={() => setShowCreateRoom(!showCreateRoom)}
          className="w-6 h-6 rounded-md bg-accent/10 hover:bg-accent/20 text-accent flex items-center justify-center transition-all duration-200"
          title="Create room"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Create Room Form */}
      {showCreateRoom && (
        <div className="card p-3 mb-3">
          <form onSubmit={handleCreateRoom} className="space-y-2">
            <input
              type="text"
              value={newRoomDisplay}
              onChange={(e) => setNewRoomDisplay(e.target.value)}
              placeholder="Room name"
              className="w-full input-primary text-sm py-2"
              autoFocus
            />
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="room-slug"
              className="w-full input-primary text-sm py-2"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent/90 text-white font-medium px-3 py-2 rounded-lg text-sm"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateRoom(false)}
                className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room List */}
      <div className="space-y-1">
        {rooms.map((room) => (
          <button
            key={room.name}
            onClick={() => handleJoinRoom(room.name)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
              currentRoom === room.name
                ? 'bg-accent text-white'
                : 'hover:bg-bg-secondary text-text-primary'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                currentRoom === room.name ? 'bg-white' : 'bg-text-muted'
              }`} />
              <span className="font-medium text-sm truncate">{room.displayName}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
              currentRoom === room.name 
                ? 'bg-white/20' 
                : 'bg-bg-tertiary text-text-muted'
            }`}>
              {room.userCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomList;