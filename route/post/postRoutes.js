const express = require('express');
const { createPostCtrl, fetchPostsCtrl, fetchPostCtrl, updatePostCtrl, deletePostCtrl, toggleAddLikeToPostCtrl, toggleAddDislikeToPostCtrl } = require('../../controllers/posts/postCtrl');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const { photoUpload, postImageResize } = require('../../middlewares/uploads/photoUpload');
const postRoutes = express.Router();

// Toggle Like/Dislike Routes
postRoutes.put('/likes', authMiddleware, toggleAddLikeToPostCtrl);
postRoutes.put('/dislike', authMiddleware, toggleAddDislikeToPostCtrl);


postRoutes.post('/', authMiddleware, photoUpload.single('image'), postImageResize, createPostCtrl);
postRoutes.get('/', fetchPostsCtrl);
postRoutes.get('/:id', fetchPostCtrl);
postRoutes.put('/:id', authMiddleware, photoUpload.single('image'), postImageResize, updatePostCtrl);
// postRoutes.put('/:id', authMiddleware, photoUpload.single('image'), postImageResize, updatePostCtrl);
postRoutes.delete('/:id', authMiddleware, deletePostCtrl);

module.exports = postRoutes;