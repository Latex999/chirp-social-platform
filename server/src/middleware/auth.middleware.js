const jwt = require('jsonwebtoken');
const { asyncHandler } = require('./async.middleware');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user.model');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }
  
  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from the token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    
    // Update last active
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });
    
    // Add user to request
    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    
    // Check if user has admin role
    if (!roles.includes('admin') && req.user.isAdmin) {
      return next();
    }
    
    // Check if user is verified if required
    if (roles.includes('verified') && !req.user.isVerified) {
      return next(
        new ErrorResponse('Email verification required for this route', 403)
      );
    }
    
    next();
  };
};

// Socket.io authentication middleware
exports.authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from the token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new Error('Authentication error'));
    }
    
    // Update last active
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });
    
    // Add user to socket
    socket.user = user;
    
    // Join user's room for private messages
    socket.join(user._id.toString());
    
    next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
};