const express = require('express');
const { userRegisterCtrl, userLoginCtrl, fetchAllUsersCtrl, deleteUserCtrl, fetchUserCtrl, userProfileCtrl, updateUserProfile, updateUserPasswordCtrl, followingUserCtrl, unfollowUserCtrl, blockUserCtrl, unBlockUserCtrl, sampleMailSendRequest, generateVerificationTokenCtrl, accountVerificationCtrl, forgotPasswordTokenCtrl, passwordResetCtrl, uploadProfilePhoto } = require('../../controllers/users/usersCtrl');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const { photoUpload, profilePhotoResize } = require('../../middlewares/uploads/photoUpload');

const userRoutes = express.Router();

userRoutes.post('/register', userRegisterCtrl);
userRoutes.post('/login', userLoginCtrl);
userRoutes.get('/sample-mail', sampleMailSendRequest);
userRoutes.put('/upload-profile-photo', authMiddleware, photoUpload.single('image'), profilePhotoResize, uploadProfilePhoto);
userRoutes.post('/generate-verify-email-token', authMiddleware, generateVerificationTokenCtrl);
userRoutes.put('/verify-account', accountVerificationCtrl);
userRoutes.post('/forgot-password-token', forgotPasswordTokenCtrl);
userRoutes.put('/reset-password', passwordResetCtrl);


userRoutes.get('/', authMiddleware, fetchAllUsersCtrl);
userRoutes.get('/profile/:id', authMiddleware, userProfileCtrl);
userRoutes.put('/profile', authMiddleware, updateUserProfile);
userRoutes.put('/follow', authMiddleware, followingUserCtrl);
userRoutes.put('/unfollow', authMiddleware, unfollowUserCtrl);
userRoutes.put('/block-user/:id', authMiddleware, blockUserCtrl);
userRoutes.put('/unblock-user/:id', authMiddleware, unBlockUserCtrl);
userRoutes.put('/password', authMiddleware, updateUserPasswordCtrl);
userRoutes.delete('/:id', deleteUserCtrl);
userRoutes.get('/:id', fetchUserCtrl);

module.exports = userRoutes;