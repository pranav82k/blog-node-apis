const express = require('express');
const { createCommentCtrl, fetchAllCommentCtrl, fetchCommentCtrl, updateCommentCtrl, deleteCommentCtrl } = require('../../controllers/comment/commentCtrl');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

const commentRoutes = express.Router();

commentRoutes.post('/', authMiddleware, createCommentCtrl);
commentRoutes.get('/', authMiddleware, fetchAllCommentCtrl);
commentRoutes.get('/:id', authMiddleware, fetchCommentCtrl);
commentRoutes.put('/:id', authMiddleware, updateCommentCtrl);
commentRoutes.delete('/:id', authMiddleware, deleteCommentCtrl);

module.exports = commentRoutes;