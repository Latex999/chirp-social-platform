const User = require('../models/user.model');
const { logger } = require('../utils/logger');

/**
 * Set up Socket.io event handlers
 * @param {Object} io - Socket.io server instance
 */
exports.setupSocketHandlers = (io) => {
  // Connection event
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}, User: ${socket.user ? socket.user._id : 'Unauthenticated'}`);
    
    // Update user's online status
    if (socket.user) {
      updateUserStatus(socket.user._id, true);
    }
    
    // Join user to their own room for private messages
    if (socket.user) {
      socket.join(socket.user._id.toString());
      logger.info(`User ${socket.user._id} joined their private room`);
    }
    
    // Handle typing events for chat
    socket.on('typing', (data) => {
      if (!socket.user) return;
      
      const { conversationId, isTyping } = data;
      
      // Emit typing event to conversation participants
      socket.to(conversationId).emit('user_typing', {
        userId: socket.user._id,
        conversationId,
        isTyping,
      });
    });
    
    // Handle read receipts for messages
    socket.on('message_read', async (data) => {
      if (!socket.user) return;
      
      const { messageId, conversationId } = data;
      
      // Update message read status in database
      // This would be handled by a message service
      
      // Emit read receipt to conversation participants
      socket.to(conversationId).emit('message_read_receipt', {
        messageId,
        userId: socket.user._id,
        conversationId,
        readAt: new Date(),
      });
    });
    
    // Handle user going offline
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      
      if (socket.user) {
        // Update user's online status after a delay
        // This prevents status flapping when user refreshes the page
        setTimeout(() => {
          // Check if user has other active connections
          const activeSockets = getActiveSocketsForUser(io, socket.user._id);
          
          if (activeSockets.length === 0) {
            updateUserStatus(socket.user._id, false);
          }
        }, 5000);
      }
    });
  });
};

/**
 * Update user's online status in the database
 * @param {string} userId - User ID
 * @param {boolean} isOnline - Whether user is online
 */
async function updateUserStatus(userId, isOnline) {
  try {
    await User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
    });
    
    logger.info(`User ${userId} status updated: ${isOnline ? 'online' : 'offline'}`);
  } catch (error) {
    logger.error(`Error updating user status: ${error.message}`);
  }
}

/**
 * Get all active socket connections for a user
 * @param {Object} io - Socket.io server instance
 * @param {string} userId - User ID
 * @returns {Array} Array of socket instances
 */
function getActiveSocketsForUser(io, userId) {
  const activeSockets = [];
  
  // Get all connected sockets
  const sockets = io.sockets.sockets;
  
  // Filter sockets by user ID
  sockets.forEach((socket) => {
    if (socket.user && socket.user._id.toString() === userId.toString()) {
      activeSockets.push(socket);
    }
  });
  
  return activeSockets;
}