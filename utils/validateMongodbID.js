const mongoose = require('mongoose');

const validateMongodbId = id => {
    isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid) throw new Error('Invalid Mongoose ID: ' + id);
}

module.exports = validateMongodbId;