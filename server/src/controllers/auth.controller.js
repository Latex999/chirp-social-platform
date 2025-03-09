const User = require('../models/user.model');
const { asyncHandler } = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, username } = req.body;
  
  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return next(new ErrorResponse('Email already in use', 400));
  }
  
  // Check if username already exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return next(new ErrorResponse('Username already taken', 400));
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    username,
  });
  
  // Generate verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  
  // Create verification URL
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
  
  // Create message
  const message = `
    <h1>Email Verification</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}" target="_blank">Verify Email</a>
  `;
  
  try {
    await sendEmail({
      to: user.email,
      subject: 'Email Verification',
      html: message,
    });
    
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Email could not be sent', err);
    
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    sendTokenResponse(user, 201, res);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }
  
  // Check for user
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  
  // Check if password matches
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  
  // Update last active
  user.lastActive = Date.now();
  await user.save({ validateBeforeSave: false });
  
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    bio: req.body.bio,
    location: req.body.location,
    website: req.body.website,
  };
  
  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );
  
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  
  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }
  
  user.password = req.body.newPassword;
  await user.save();
  
  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }
  
  // Get reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  
  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
  
  const message = `
    <h1>Password Reset</h1>
    <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">Reset Password</a>
  `;
  
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: message,
    });
    
    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.error('Email could not be sent', err);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
  
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  
  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }
  
  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  
  sendTokenResponse(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:verificationtoken
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.verificationtoken)
    .digest('hex');
  
  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });
  
  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }
  
  // Set user as verified
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.generateAuthToken();
  
  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  
  // Remove password from output
  user.password = undefined;
  
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: user,
    });
};