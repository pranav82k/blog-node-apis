const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First Name is required"]
    },
    lastName: {
        type: String,
        required: [true, "Last Name is required"]
    },
    profilePhoto: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__480.png"
    },
    email: {
        type: String,
        required: [true, "Email Address is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    bio: String,
    postCount: {
        type: Number,
        default:0
    },
    isBlocked: {
        type: Boolean,
        default:false
    },
    isAdmin: {
        type: Boolean,
        default:false
    },
    role: {
        type:String,
        enum: ["Admin", "Guest", "Blogger"],
    },
    isFollowing: {
        type:Boolean,
        default:false
    },
    isUnfollowing: {
        type:Boolean,
        default:false
    },
    isAccountVerified: {
        type:Boolean,
        default:false
    },
    accountVerificationToken: String,
    accountVerificationTokenExpires: Date,
    viewedBy:{
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    followers: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    following: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    active: {
        type: Boolean,
        default:false
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    timestamps: true
});

// Virtual Method to fetch list of posts of user
userSchema.virtual("posts", {
    ref: 'Post',
    foreignField: 'user',
    localField: '_id'
});

// Virtual Method to add accountType to user
userSchema.virtual("accountType").get(function () {
    const follwersCount = this.followers?.length;
    return follwersCount >= 5 ? "Pro Account" : "Starter Account";
});

// Pre Hooks
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password Matched Method
userSchema.methods.isPasswordMatched = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Verify Account
userSchema.methods.createAccountVerificatioToken = async function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.accountVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.accountVerificationTokenExpires = Date.now() + 30 * 60 * 1000 // 10 Minutes

    return verificationToken;
}

// Reset Password Token Generation
userSchema.methods.createResetPasswordToken = async function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 Minutes

    return resetToken;
};


const User = mongoose.model('User', userSchema);
module.exports = User;