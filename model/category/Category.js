const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required"]
    },
    title: {
        type: String,
        required: [true, "Title is required"]
    }
}, { timestamps: true});

// Compile the category schema into an object

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;