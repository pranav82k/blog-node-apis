const expressAsyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../../model/user/User');

const authMiddleware = expressAsyncHandler( async(req, res, next) => {
    let token;

    if(req?.headers?.authorization?.startsWith('Bearer ')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            if(token) {
                decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const user = await User.findById(decoded?.id).select('-password');
                // console.log(user);
                req.user = user;
                next();
            } else {
                throw new Error('Invalid authorization token: ' + token);
            }
        } catch (error) {
            throw new Error(error.message);
        }
    } else {
        throw new Error('No token provided');
    }
});

module.exports = authMiddleware;