const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, "Post is required"]
    },
    user: {
        type: Object,
        required: [true, "User is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    }
}, { timestamps: true });

// Compile the comment schema
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;