const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [280, 'Post cannot exceed 280 characters'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  media: [{
    type: String,
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  retweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isRepost: {
    type: Boolean,
    default: false,
  },
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  hashtags: [{
    type: String,
    trim: true,
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isReply: {
    type: Boolean,
    default: false,
  },
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  isQuote: {
    type: Boolean,
    default: false,
  },
  quotedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  scheduledFor: {
    type: Date,
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'mentioned'],
    default: 'public',
  },
  location: {
    type: String,
    trim: true,
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  poll: {
    options: [{
      text: String,
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
    }],
    expiresAt: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ 'coordinates.coordinates': '2dsphere' });
postSchema.index({ content: 'text' });

// Virtual fields
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('retweetsCount').get(function() {
  return this.retweets.length;
});

postSchema.virtual('comments', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'parentPost',
  match: { isReply: true, isDeleted: false },
});

postSchema.virtual('commentsCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'parentPost',
  count: true,
  match: { isReply: true, isDeleted: false },
});

// Middleware to extract hashtags and mentions from content
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Extract hashtags
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    
    while ((match = hashtagRegex.exec(this.content)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }
    
    this.hashtags = [...new Set(hashtags)]; // Remove duplicates
    
    // Extract mentions (this would need to be resolved to actual user IDs in the controller)
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    
    while ((match = mentionRegex.exec(this.content)) !== null) {
      mentions.push(match[1].toLowerCase());
    }
    
    // Mentions will be resolved to user IDs in the controller
  }
  
  next();
});

// Static method to get feed for a user
postSchema.statics.getFeed = async function(userId, page = 1, limit = 10) {
  const user = await mongoose.model('User').findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Get IDs of users to include in feed (following + self)
  const followingIds = user.following;
  const feedUserIds = [...followingIds, userId];
  
  // Get IDs of blocked users
  const blockedUserIds = user.blockedUsers || [];
  
  // Calculate skip value for pagination
  const skip = (page - 1) * limit;
  
  // Query posts
  const posts = await this.find({
    author: { $in: feedUserIds, $nin: blockedUserIds },
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
  
  return posts;
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;