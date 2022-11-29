const Post = require("../../model/post/Post");
const expressAsyncHandler = require("express-async-handler");
const Filter = require('bad-words');
const User = require("../../model/user/User");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const fs = require('fs');
const validateMongodbId = require("../../utils/validateMongodbID");
const blockUser = require("../../utils/blockUser");
const Comment = require("../../model/comment/Comment");

// Create Post
const createPostCtrl = expressAsyncHandler( async (req, res) => {
    // console.log(req.body);
    const { _id } = req?.user;

    // Check if user is blocked
    blockUser(req?.user);

    // Prevent to create the post, if user accountType is starter and have done with maximum post creation
    if(req?.user?.accountType === "Starter Account" && req?.user?.postCount >= 2) {
        throw new Error(`You have reached the maximum post creation, upgrade your account to Pro by increasing your followers.`);
    }

    // Check for bad words
    const filter = new Filter();
    const isProfane = filter.isProfane(req?.body?.title?.toLowerCase(), req?.body?.description?.toLowerCase());
    if(isProfane) {
        await User.findByIdAndUpdate(_id, {
            isBlocked: true
        });

        throw new Error('Creating failed because it contains profane words and you have been blocked');
    }

    try {
        if(req?.file) {
            const localPath = `public/images/posts/${req?.file?.filename}`;
            const imageUploaded = await cloudinaryUploadImg(localPath);
            
            // Create the post
            const post = await Post.create({...req?.body, image: imageUploaded?.url, user: _id });

            // Update the user's postCount
            const user = await User.findByIdAndUpdate(_id, {
                $inc: { postCount: 1}
            }, { new: true });

            res.json(post);
            fs.unlinkSync(localPath);
        } else {
            const post = await Post.create({...req?.body, user: _id });
            res.json(post);
        }
    } catch (error) {
        res.json(error);
    }
});

// Fetch all posts
const fetchPostsCtrl = expressAsyncHandler( async (req, res) => {
    const hasCategory = req?.query?.category;
    // console.log(hasCategory);
    try {
        let posts;
        if(hasCategory) {
            posts = await Post.find({ category: hasCategory }).sort('-createdAt').populate('user');
        } else {
            posts = await Post.find({}).sort('-createdAt').populate('user');
        }
        res.json(posts);
    } catch (error) {
        res.json(error);
    }
});

// Fetch a single post
const fetchPostCtrl = expressAsyncHandler( async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        // const post = await Post.findById(id).populate('user');

        const updatedPost = await Post.findByIdAndUpdate(id, {
            $inc: { numViews: 1 }
        }, { new: true }).populate('user').populate('likes').populate('dislikes').populate('comments');
        res.json(updatedPost);
    } catch (error) {
        res.json(error);
    }
});

// Update Post Controller
const updatePostCtrl = expressAsyncHandler( async (req, res) => {
    
    const { id } = req?.params;
    validateMongodbId(id);

    const { _id } = req?.user;
    
    // Check if user is blocked
    blockUser(req?.user);

    const filter = new Filter();
    const isProfane = filter.isProfane(req?.title?.toLowerCase(), req?.body?.toLowerCase());
    if(isProfane) {
        await User.findByIdAndUpdate(_id, {
            isBlocked: true
        });

        throw new Error('Creating failed because it contains profane words and you have been blocked');
    }

    try {
        let post;
        if(req.file) {
            // const localPath = `public/images/posts/${req.file.filename}`;
            // const imageUploaded = await cloudinaryUploadImg(localPath);
            post = await Post.findByIdAndUpdate(id, {
                ...req?.body
                // , image: imageUploaded?.url
            }, { new: true });
            // fs.unlinkSync(localPath);
        } else {
            // console.log(req?.body);
            post = await Post.findByIdAndUpdate(id, {
                ...req?.body
            }, { new: true });
        }
        res.json(post);
    } catch (error) {
        res.json(error);
    }
});


// Delete Post Controller
const deletePostCtrl = expressAsyncHandler( async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedPost = await Post.findByIdAndDelete(id);
        if(deletedPost) {
            // delete all the comments of the post
            const deletedComment = await Comment.deleteMany({ post: deletedPost?._id });
            res.json(deletedPost);
        } else {
            res.status(500).json({message: 'Couldn\'t find post with id ' + id});
        }
    } catch (error) {
        res.json(error);
    }
});

// I will add check for only deleting the post either by admin or by the person who created it.

// Toggle Add Like to Post
const toggleAddLikeToPostCtrl = expressAsyncHandler( async (req, res) => {
    const { postId } = req?.body;
    const loginUserId = req?.user?._id;

    const post = await Post.findById(postId);
    if(!post) throw new Error(`Couldn't find post ${postId}`);

    isAlreadyDisliked = post?.dislikes.find(userId => userId.toString() === loginUserId.toString());
    if(isAlreadyDisliked)
    {
        await Post.findByIdAndUpdate(postId, {
            $pull: { dislikes: loginUserId },
            isDisLiked: false
        }, { new: true });
    }
    
    let updatedPost;
    isAlreadyLiked = post?.likes?.find(userId => userId.toString() === loginUserId.toString());
    if (isAlreadyLiked) {
        updatedPost = await Post.findByIdAndUpdate(postId, {
            $pull: { likes: loginUserId },
            isLiked: false
        }, { new: true });
    } else {
        updatedPost = await Post.findByIdAndUpdate(postId, {
            $push: { likes: loginUserId },
            isLiked: true
        }, { new: true });
    }
    res.json(updatedPost);
});


// Toggle Add Dislike to Post
const toggleAddDislikeToPostCtrl = expressAsyncHandler( async (req, res) => {
    const { postId } = req?.body;
    const loginUserId = req?.user?._id;

    const post = await Post.findById(postId);
    if(!post) throw new Error(`No such post existing ${postId}`);

    // If the user already liked this post
    isAlreadyLiked = post?.likes?.find(userId => userId.toString() === loginUserId.toString());
    if(isAlreadyLiked) {
        await Post.findByIdAndUpdate(postId, {
            $pull: { likes: loginUserId },
            isLiked: false
        }, { new: true });
    }

    let updatedPost;
    // Check if the user already disliked this post
    isAlreadydisLiked = post?.dislikes?.find(userId => userId.toString() === loginUserId.toString());
    if(isAlreadydisLiked) {
        // Remove the user from the list of dislikes
        updatedPost = await Post.findByIdAndUpdate(postId, {
            $pull: { dislikes: loginUserId },
            isDisLiked: false
        }, { new: true });
    } else {
        updatedPost = await Post.findByIdAndUpdate(postId, {
            $push: { dislikes: loginUserId },
            isDisLiked: true
        }, { new: true });
    }

    res.json(updatedPost);
});


module.exports = {
    createPostCtrl, fetchPostsCtrl, fetchPostCtrl, updatePostCtrl, deletePostCtrl, toggleAddLikeToPostCtrl, toggleAddDislikeToPostCtrl
}