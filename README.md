# Real-Time Chat Application

A modern, real-time chat application built with React on the frontend and Node.js with Socket.IO on the backend. Features include user authentication, public rooms, private messaging, and a responsive UI.

##  Features

- **Real-Time Messaging**: Instant message delivery using WebSockets
- **User Authentication**: Simple username-based login system
- **Public Rooms**: Create and join chat rooms for group conversations
- **Private Messaging**: Send direct messages to other users
- **Online User List**: See who's currently online
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS

##  Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Day.js** - Date/time formatting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

##  Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realtime-chat
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup** (Optional)
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=3001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

##  Running the Application

### Development Mode

1. **Start the server** (from server directory)
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3001`

2. **Start the client** (from client directory)
   ```bash
   npm run dev
   ```
   The client will start on `http://localhost:5173`

### Production Build

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Start the server** (from server directory)
   ```bash
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Enter a username to log in
3. Start chatting in the default "General" room
4. Create new rooms or send private messages to other users
5. View the list of online users in the sidebar

## Project Structure

```
realtime-chat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── chat/       # Chat-related components
│   │   │   └── sidebar/    # Sidebar components
│   │   ├── pages/          # Page components
│   │   ├── socket/         # Socket.IO client setup
│   │   ├── store/          # Zustand state management
│   │   └── styles/         # CSS styles
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── sockets/        # Socket.IO event handlers
│   │   ├── utils/          # Utility functions
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── package.json
│   └── test-client.html    # Simple test client
└── README.md
```

##  API Reference

### Socket Events

#### Authentication
- `user:login` - Log in with username
- `user:online` - Broadcast when user comes online
- `user:offline` - Broadcast when user goes offline

#### Rooms
- `rooms:list` - Get list of available rooms
- `room:create` - Create a new room
- `room:join` - Join a room
- `room:leave` - Leave a room
- `room:message` - Send message to room
- `message:room` - Receive room message

#### Private Messages
- `private:message` - Send private message
- `message:private` - Receive private message

#### Users
- `users:online` - Get list of online users

### REST Endpoints

- `GET /` - Server info
- `GET /health` - Health check

##  Testing

A simple test client is available at `server/test-client.html` for basic testing without the React frontend.

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


##  Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [React](https://reactjs.org/) for the UI framework
- [Tailwind CSS](https://tailwindcss.com/) for styling</content>
<parameter name="filePath">c:\Users\Administrator\Documents\Boomerange\reaLtime-chat\README.md