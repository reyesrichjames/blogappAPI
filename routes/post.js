const express = require('express');
const postController = require('../controllers/post');
const commentController = require('../controllers/comment');
const { verify, verifyAdmin } = require('../auth');

const router = express.Router();

// Blog post routes
router.post('/addPost', verify, postController.addPost);
router.patch('/updatePost/:postId', verify, postController.updatePost);
router.delete('/deletePost/:postId', verify, postController.deletePost);
router.get('/getPosts', postController.getPosts); // all users
router.get('/getPost/:postId', postController.getPost); // all users
router.get('/getPopularPosts', postController.getPopularPosts); // all users
// Comment routes
router.post('/addComment/:postId', verify, commentController.addComment); // only logged-in users can add comments
router.get('/getComments/:postId', commentController.getComments); // all users
router.delete('/deleteComment/:commentId', verify, verifyAdmin, commentController.deleteComment); // admin only
router.post('/addGuestComment/:postId', commentController.addGuestComment); // guests can add comments

module.exports = router; 