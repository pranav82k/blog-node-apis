const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log("DB connection established")
    } catch (error) {
        console.log(`Error connecting to Mongo: ${error.message}`);
    }
};

module.exports = dbConnect;