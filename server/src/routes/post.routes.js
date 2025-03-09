const express = require('express');
const {
  createPost,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  repostPost,
  getUserPosts,
} = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Protected routes
router.post('/', protect, upload.array('media', 4), createPost);
router.get('/feed', protect, getFeed);
router.post('/:id/like', protect, likePost);
router.post('/:id/unlike', protect, unlikePost);
router.post('/:id/repost', protect, repostPost);

// Public routes (some with optional auth)
router.get('/:id', getPost);
router.get('/user/:userId', getUserPosts);

// Protected routes with ownership check
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;