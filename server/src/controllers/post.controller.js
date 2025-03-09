const Post = require('../models/post.model');
const User = require('../models/user.model');
const { asyncHandler } = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  const { content, isReply, parentPost, isQuote, quotedPost, scheduledFor } = req.body;
  
  // Create post object
  const postData = {
    content,
    author: req.user.id,
    isReply: isReply || false,
    parentPost: isReply ? parentPost : undefined,
    isQuote: isQuote || false,
    quotedPost: isQuote ? quotedPost : undefined,
    scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
  };
  
  // Handle media uploads
  if (req.files && req.files.length > 0) {
    const mediaUrls = [];
    
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.path, 'posts');
      mediaUrls.push(result.secure_url);
    }
    
    postData.media = mediaUrls;
  }
  
  // Create post
  const post = await Post.create(postData);
  
  // Populate author and other references
  await post.populate([
    { path: 'author', select: 'name username avatar isVerified' },
    {
      path: 'parentPost',
      populate: {
        path: 'author',
        select: 'name username avatar isVerified',
      },
    },
    {
      path: 'quotedPost',
      populate: {
        path: 'author',
        select: 'name username avatar isVerified',
      },
    },
  ]);
  
  // If this is a reply, increment the parent post's comment count
  if (isReply && parentPost) {
    // This is handled by the virtual field in the Post model
  }
  
  // If this is a quote, increment the quoted post's quote count
  if (isQuote && quotedPost) {
    // You could add a quotes virtual field to the Post model
  }
  
  // Process mentions to create notifications
  if (post.mentions && post.mentions.length > 0) {
    // This would be handled by a notification service
  }
  
  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('new_post', post);
  }
  
  res.status(201).json({
    success: true,
    data: post,
  });
});

// @desc    Get all posts (feed)
// @route   GET /api/posts/feed
// @access  Private
exports.getFeed = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  // Get posts for feed using the static method
  const posts = await Post.getFeed(req.user.id, page, limit);
  
  // Check if there are more posts
  const nextPage = page + 1;
  const nextPagePosts = await Post.getFeed(req.user.id, nextPage, 1);
  const hasMore = nextPagePosts.length > 0;
  
  res.status(200).json({
    success: true,
    count: posts.length,
    hasMore,
    data: posts,
  });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name username avatar isVerified')
    .populate({
      path: 'originalPost',
      populate: {
        path: 'author',
        select: 'name username avatar isVerified',
      },
    })
    .populate({
      path: 'quotedPost',
      populate: {
        path: 'author',
        select: 'name username avatar isVerified',
      },
    });
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Check if post is deleted
  if (post.isDeleted) {
    return next(new ErrorResponse(`Post has been deleted`, 410));
  }
  
  // Check if post is scheduled for future
  if (post.scheduledFor && post.scheduledFor > new Date()) {
    // Only allow the author to see scheduled posts
    if (!req.user || req.user.id !== post.author._id.toString()) {
      return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
    }
  }
  
  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is post owner
  if (post.author.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this post`, 401));
  }
  
  // Check if post is already published
  const now = new Date();
  if (!post.scheduledFor || post.scheduledFor <= now) {
    return next(new ErrorResponse(`Published posts cannot be edited`, 400));
  }
  
  // Update post
  post = await Post.findByIdAndUpdate(
    req.params.id,
    { content: req.body.content, scheduledFor: req.body.scheduledFor ? new Date(req.body.scheduledFor) : post.scheduledFor },
    { new: true, runValidators: true }
  ).populate('author', 'name username avatar isVerified');
  
  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is post owner
  if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this post`, 401));
  }
  
  // Soft delete the post
  post.isDeleted = true;
  post.deletedAt = Date.now();
  await post.save();
  
  // Delete media from Cloudinary if exists
  if (post.media && post.media.length > 0) {
    for (const mediaUrl of post.media) {
      try {
        const publicId = mediaUrl.split('/').pop().split('.')[0];
        await deleteFromCloudinary(publicId, 'posts');
      } catch (err) {
        console.error('Error deleting media from Cloudinary:', err);
      }
    }
  }
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Check if post is already liked
  if (post.likes.includes(req.user.id)) {
    return next(new ErrorResponse(`Post already liked`, 400));
  }
  
  // Add user to likes array
  post.likes.push(req.user.id);
  await post.save();
  
  // Create notification for post author
  if (post.author.toString() !== req.user.id) {
    // This would be handled by a notification service
  }
  
  // Emit socket event for real-time updates
  if (req.io) {
    req.io.to(post.author.toString()).emit('post_liked', {
      postId: post._id,
      userId: req.user.id,
    });
  }
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Unlike a post
// @route   POST /api/posts/:id/unlike
// @access  Private
exports.unlikePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Check if post is not liked
  if (!post.likes.includes(req.user.id)) {
    return next(new ErrorResponse(`Post not liked yet`, 400));
  }
  
  // Remove user from likes array
  post.likes = post.likes.filter(
    (like) => like.toString() !== req.user.id
  );
  await post.save();
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Repost a post
// @route   POST /api/posts/:id/repost
// @access  Private
exports.repostPost = asyncHandler(async (req, res, next) => {
  const originalPost = await Post.findById(req.params.id);
  
  if (!originalPost) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user has already reposted this post
  const existingRepost = await Post.findOne({
    author: req.user.id,
    originalPost: req.params.id,
    isRepost: true,
  });
  
  if (existingRepost) {
    return next(new ErrorResponse(`You have already reposted this post`, 400));
  }
  
  // Create repost
  const repost = await Post.create({
    author: req.user.id,
    isRepost: true,
    originalPost: req.params.id,
    content: '', // Reposts don't have their own content
  });
  
  // Add user to retweets array of original post
  originalPost.retweets.push(req.user.id);
  await originalPost.save();
  
  // Populate repost
  await repost.populate([
    { path: 'author', select: 'name username avatar isVerified' },
    {
      path: 'originalPost',
      populate: {
        path: 'author',
        select: 'name username avatar isVerified',
      },
    },
  ]);
  
  // Create notification for original post author
  if (originalPost.author.toString() !== req.user.id) {
    // This would be handled by a notification service
  }
  
  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('new_post', repost);
    req.io.to(originalPost.author.toString()).emit('post_reposted', {
      postId: originalPost._id,
      userId: req.user.id,
    });
  }
  
  res.status(201).json({
    success: true,
    data: repost,
  });
});

// @desc    Get posts by user
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Check if user exists
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.userId}`, 404));
  }
  
  // Get posts by user
  const posts = await Post.find({
    author: req.params.userId,
    isReply: false,
    isDeleted: false,
    $or: [
      { scheduledFor: { $exists: false } },
      { scheduledFor: { $lte: new Date() } },
    ],
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name username avatar isVerified')
    .populate({
      path: 'originalPost',
      populate: {
        path: 'author',
        select: 'name username avatar isVerified',
      },
    })
    .populate({
      path: 'quotedPost',
      populate: {
        path: 'author',
        select: 'name username avatar isVerified',
      },
    });
  
  // Check if there are more posts
  const nextPage = page + 1;
  const nextPagePosts = await Post.find({
    author: req.params.userId,
    isReply: false,
    isDeleted: false,
    $or: [
      { scheduledFor: { $exists: false } },
      { scheduledFor: { $lte: new Date() } },
    ],
  })
    .sort({ createdAt: -1 })
    .skip(skip + limit)
    .limit(1);
  
  const hasMore = nextPagePosts.length > 0;
  
  res.status(200).json({
    success: true,
    count: posts.length,
    hasMore,
    data: posts,
  });
});