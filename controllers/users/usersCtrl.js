const User = require("../../model/user/User");
const expressAsyncHandler = require("express-async-handler");
const crypto = require("crypto");
const fs = require("fs");
const sgMail = require("@sendgrid/mail");
const generateToken = require("../../config/token/generateToken");
const validateMongodbId = require("../../utils/validateMongodbID");
const mongoose = require("mongoose");
const cloudinaryUploadImg = require("../../utils/cloudinary");

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

// User Registration Function
const userRegisterCtrl = expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    const { firstName, lastName, email, password } = req?.body;
    const userExist = await User.findOne({ email });
    if(userExist) {
        throw new Error("User already exists");
    }
    
    try {
        const user = await User.create({
            firstName, lastName, email, password
        });
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

// User Login Function
const userLoginCtrl = expressAsyncHandler(async (req, res) => {
    const { email, password } = req?.body;
    console.log(req.body);
    const userExist = await User.findOne({ email });
    // console.log(await userExist.isPasswordMatched(password));
    if(userExist && await userExist.isPasswordMatched(password)) {
        // res.json(userExist);
        res.json({
            _id: userExist?._id,
            firstName: userExist?.firstName,
            lastName: userExist?.lastName,
            email: userExist?.email,
            profilePhoto: userExist?.profilePhoto,
            isAdmin: userExist?.isAdmin,
            token: generateToken(userExist._id)
        });
    }
    else{
        res.status(401);
        throw new Error('Invalide Email or Password');
    }
});

// Fetch all users
const fetchAllUsersCtrl = expressAsyncHandler(async (req, res) => {
    try {
        // const users = await User.find({}).sort('-createdAt');
        // const users = await User.find({}).select('-password').sort('-createdAt').skip(1).limit(1);
        const users = await User.find({}).select('-password').sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.json(error);
    }
});

// Delete User
const deleteUserCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        console.log(deletedUser);
        if(deletedUser) {
            console.log('yes')
            res.json(deletedUser);
        } else {
            console.log('no');
            res.status(202).json({ message: 'User Already Deleted' });
            // throw new Error('User Already deleted'); // throw error is not working inside try
        }
    } catch (error) {
        res.json(error);
    }
});

// Fetch User/ User Details
const fetchUserCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

// User Profile
const userProfileCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const user = await User.findById(id).populate('posts');
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

const updateUserProfile = expressAsyncHandler(async (req, res) => {
    const { _id } = req?.user;
    
    const { firstName, lastName, email, bio } = req?.body;
    validateMongodbId(_id);
    try {
        const user = await User.findByIdAndUpdate(_id, {
            firstName, lastName, email, bio
        }, { new: true, runValidators: true });
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});


// Update User Password
const updateUserPasswordCtrl = expressAsyncHandler( async (req, res) => {
    const { _id } = req?.user;
    validateMongodbId(_id);
    const { password } = req?.body;
    try {
        const user = await User.findById(_id);
        if(user && password) {
            user.password = password;
            await user.save();
            res.json(user);
        } else {
            res.status(500).json({ message: 'Something went wrong'});
        }
    } catch (error) {
        res.json(error);   
    }
});

// User Following
const followingUserCtrl = expressAsyncHandler( async(req, res) => {
    const { followId } = req?.body;
    validateMongodbId(followId);

    const loginUserId = req?.user?.id;
    const targetUser = await User.findById(followId);
        
    const alreadyFollowing = targetUser?.followers.find(user => user.toString() === loginUserId.toString());
    if(alreadyFollowing) throw new Error('You have already been follow this user');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await User.findByIdAndUpdate(followId, {
            $push: { followers: loginUserId },
            isFollowing: true
        }, { new: true });
        
        await User.findByIdAndUpdate(loginUserId, {
            $push: { following: followId }
        }, { new: true });

        await session.commitTransaction();
        session.endSession();
        res.json({ message: 'Following successfully'})
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(error);
    }
});

// unfollow user
const unfollowUserCtrl = expressAsyncHandler(async (req, res) => {
    const { unFollowId } = req?.body;
    const loginUserId = req?.user?.id;
    validateMongodbId(unFollowId);
    
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        // find and update the target user
        await User.findByIdAndUpdate(unFollowId, {
            $pull: { followers: loginUserId },
            isFollowing: false
        }, { new: true});

        await User.findByIdAndUpdate(loginUserId, {
            $pull: { following: unFollowId }
        }, { new: true});

        session.commitTransaction();
        session.endSession();
        res.json("You have successfully unfollow the user");
    } catch (error) {
        session.abortTransaction();
        session.endSession();
        res.json(error);
    }
});

// Block User
const blockUserCtrl = expressAsyncHandler( async (req, res) => {
    const { id } = req?.params;
    validateMongodbId(id);

    try {
        const user = await User.findByIdAndUpdate(id, {
            isBlocked: true
        }, { new: true});
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

// Unblock User
const unBlockUserCtrl = expressAsyncHandler( async (req, res) => {
    const { id } = req?.params;
    validateMongodbId(id);

    try {
        const user = await User.findByIdAndUpdate(id, {
            isBlocked: false
        }, { new: true});
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

// Send Sample Mail Request
const sampleMailSendRequest = expressAsyncHandler( async (req, res) => {
    try {
        const msg = {
            to: 'ypranav1995@gmail.com',
            from: process.env.SEND_GRID_FROM_MAIL,
            subject: 'My First Mail Request',
            text: 'This is my first mail request',
        };
        console.log(msg);

        await sgMail.send(msg);
        res.json({
            success: true,
            message: 'Message Sent Successfully'
        }); 
    } catch (error) {
        res.json(error);
    }
});


// Generate Email verification token
const generateVerificationTokenCtrl = expressAsyncHandler(async (req, res) => {
    user = req?.user;
        if(user?.isAccountVerified) {
            throw new Error(`${user.firstName} ${user.lastName} is already verified`);
        }
    
    try {
        const verificationToken = await user.createAccountVerificatioToken();
        await user.save();

        const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/verify-account/${verificationToken}">Click to verify your account</a>`;

        const msg = {
            to: req?.user?.email,
            from: process.env.SEND_GRID_FROM_MAIL,
            subject: 'Email verification',
            html: resetURL
        }
        await sgMail.send(msg);
        res.json({
            success: true,
            message: 'Email verification Sent Successfully',
            url: resetURL
        });
    } catch (err) {
        res.json(err);
    }
});

// Verify Account
const accountVerificationCtrl = expressAsyncHandler( async (req, res) => {
    const { token } = req?.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // try {
        const userFound = await User.findOne({ accountVerificationToken: hashedToken, accountVerificationTokenExpires: { $gt: new Date() } });
        if(!userFound) throw new Error('Token Expired');

        userFound.isAccountVerified = true;
        userFound.accountVerificationToken = undefined;
        userFound.accountVerificationTokenExpires = undefined;

        await userFound.save();
        res.json({
            success: true,
            message: 'Account verification process is successful.',
            user: userFound
        });
    // } catch (error) {
    //     res.json(error);
    // }
});


// Forgot password token generation
const forgotPasswordTokenCtrl = expressAsyncHandler( async (req, res) => {
    const { email } = req?.body;

    const user = await User.findOne({ email });
    if(!user) throw new Error(`User not found`);

    try {
        const token = await user.createResetPasswordToken();
        await user.save();

        resetURL = `If you were requested to reset your password, please reset now within 10 minutes, otherwise ignore this message <a href="https://localhost:3000/reset-password/${token}">Click to reset password</a>`;

        msg = {
            to: email,
            from: process.env.SEND_GRID_FROM_MAIL,
            subject: 'Reset Password',
            html: resetURL
        }

        await sgMail.send(msg);
        res.json({
            message: `Reset Password email sent successfully`,
            resetURL
        })
    } catch (error) {
        res.json(error);
    }
})

//Reset Password
const passwordResetCtrl = expressAsyncHandler( async (req, res) => {
    const { token, password } = req?.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({ token: hashedToken, passwordResetExpires: { $gt: Date.now() }});
    if(!user) throw new Error(`Token expired, please try again`);

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangeAt = Date.now();

    await user.save();
    res.json(user);
});


// Upload profile photo
const uploadProfilePhoto = expressAsyncHandler( async (req, res) => {
    // console.log(req.file);
    const { _id } = req?.user;

    const localPath = `public/images/profile/${req.file.filename}`;
    const imageUploaded = await cloudinaryUploadImg(localPath);
    console.log(imageUploaded);
    
    const user = await User.findByIdAndUpdate(_id, {
        profilePhoto: imageUploaded?.url
    }, { new: true});

    res.json(user);
    fs.unlinkSync(localPath);
});

module.exports = {userRegisterCtrl, userLoginCtrl, fetchAllUsersCtrl, deleteUserCtrl, fetchUserCtrl, userProfileCtrl, updateUserProfile, updateUserPasswordCtrl, followingUserCtrl, unfollowUserCtrl, blockUserCtrl, unBlockUserCtrl, sampleMailSendRequest, generateVerificationTokenCtrl, accountVerificationCtrl, forgotPasswordTokenCtrl, passwordResetCtrl, uploadProfilePhoto };