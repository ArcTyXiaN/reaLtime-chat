/**
 * In-memory user storage and management
 */
class UserManager {
  constructor() {
    this.users = new Map(); // socketId -> user object
    this.usersByUsername = new Map(); // username -> user object
  }

  /**
   * Add a new user
   */
  addUser(socketId, username) {
    const user = {
      socketId,
      username,
      currentRoom: 'general',
      joinedAt: new Date(),
    };
    
    this.users.set(socketId, user);
    this.usersByUsername.set(username, user);
    return user;
  }

  /**
   * Remove a user by socket ID
   */
  removeUser(socketId) {
    const user = this.users.get(socketId);
    if (user) {
      this.users.delete(socketId);
      this.usersByUsername.delete(user.username);
    }
    return user;
  }

  /**
   * Get user by socket ID
   */
  getUser(socketId) {
    return this.users.get(socketId);
  }

  /**
   * Get user by username
   */
  getUserByUsername(username) {
    return this.usersByUsername.get(username);
  }

  /**
   * Update user's current room
   */
  updateUserRoom(socketId, roomName) {
    const user = this.users.get(socketId);
    if (user) {
      user.currentRoom = roomName;
    }
    return user;
  }

  /**
   * Get all users in a specific room
   */
  getUsersInRoom(roomName) {
    return Array.from(this.users.values()).filter(
      (user) => user.currentRoom === roomName
    );
  }

  /**
   * Get all online users
   */
  getAllUsers() {
    return Array.from(this.users.values());
  }

  /**
   * Check if username is taken
   */
  isUsernameTaken(username) {
    return this.usersByUsername.has(username);
  }
}

export const userManager = new UserManager();