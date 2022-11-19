const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Post Title is required"],
        trim: true
    },
    category: {
        type: String,
        required: [true, "Post Category is required"]
    },
    isLiked: {
        type: Boolean,
        default: false
    },
    isDisLiked: {
        type: Boolean,
        default: false
    },
    numViews: {
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Post User is required"],
    },
    description: {
        type: String,
        required: [true, "Post Description is required"],
    },
    image: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2020/10/25/09/23/seagull-5683637_960_720.jpg"
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: { virtuals: true },
    timestamps: true
});

// Setup a virtual method to populate the comments
postSchema.virtual('comments', {
    ref: "Comment",
    foreignField: "post",
    localField: "_id"
});

// Compile
const Post = mongoose.model('Post', postSchema);
module.exports = Post;