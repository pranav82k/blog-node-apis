const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    console.log(req.body);
    if(file?.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb({
            message: 'Only images are allowed'
        }, false);
    }
}

const photoUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 1000000 // 1 MB
    }
});

// Profile Photo Resizing
const profilePhotoResize = async (req, res, next) => {
    // IF we have no file to upload then just skip the resize request and return next();
    if(!req.file) return next();

    // Replace spacing and add a parameter to the file request object
    req.file.filename = `user-${Date.now()}-${req.file.originalname.split(' ').join('_')}`;

    await sharp(req.file.buffer)
        .resize(250, 250)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path.join(`public/images/profile/${req.file.filename}`));
    // Resize and save here
    next();
};

//Resize and save POST image
const postImageResize = async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `post-${Date.now()}-${req.file.originalname.split(' ').join('_')}`;

    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path.join(`public/images/posts/${req.file.filename}`));
    
    next();
};


module.exports = {
    photoUpload, profilePhotoResize, postImageResize
};