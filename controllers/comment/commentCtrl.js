const expressAsyncHandler = require("express-async-handler");
const Comment = require("../../model/comment/Comment");
const blockUser = require("../../utils/blockUser");
const validateMongodbId = require("../../utils/validateMongodbID");


// Create Comment
const createCommentCtrl = expressAsyncHandler( async(req, res) => {
    const user = req?.user;
    
    // Check if user is blocked
    blockUser(user);

    const { postId, description } = req?.body;

    try {
        const comment = await Comment.create({ post: postId, user, description });
        res.json(comment);
    } catch (error) {
        res.json(error);
    }
});


// Fetch All comments
const fetchAllCommentCtrl = expressAsyncHandler( async(req, res) => {
    try {
        const comments = await Comment.find({}).sort('-createdAt');
        res.json(comments);
    } catch (error) {
        res.json(error);
    }
});


// Fetch Comment Details
const fetchCommentCtrl = expressAsyncHandler( async(req, res) => {
    const { id } = req?.params;
    validateMongodbId(id);
    try {
        const comment = await Comment.findById(id);
        if(!comment) res.json("Comment not found");
        res.json(comment);
    } catch (error) {
        res.json(error);
    }
});


// Update Comment
const updateCommentCtrl = expressAsyncHandler( async(req, res) => {
    const { id } = req?.params;
    validateMongodbId(id);
    const { description } = req?.body;

    // Check if user is blocked
    blockUser(req?.user);
    try {
        const comment = await Comment.findByIdAndUpdate(id,
            { description },
            { new: true, runValidators: true }
        );
        
        if(comment) res.json(comment)
        else res.json("Comment not updated");
    } catch (error) {
        res.json(error);
    }
});


// Delete Comment
const deleteCommentCtrl = expressAsyncHandler( async(req, res) => {
    const { id } = req?.params;
    validateMongodbId(id);

    try {
        const deletedComment = await Comment.findByIdAndDelete(id);
        if(deletedComment) res.json(deletedComment);
        else res.json("Comment not deleted");
    } catch (error) {
        res.json(error);
    }
});

module.exports = {
    createCommentCtrl,
    fetchAllCommentCtrl,
    fetchCommentCtrl,
    updateCommentCtrl,
    deleteCommentCtrl
}