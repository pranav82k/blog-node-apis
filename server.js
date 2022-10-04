const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const dbConnect = require('./config/db/dbConnect');
const userRoutes = require('./route/users/userRoutes');
const { errorHandler, notFoundError } = require('./middlewares/error/errorHandler');
const postRoutes = require('./route/post/postRoutes');
const commentRoutes = require('./route/comment/commentRoutes');
const emailMsgRoutes = require('./route/emailMsg/emailMsgRoute');
const categoryRoutes = require('./route/category/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connectivity function
dbConnect();

// Middeware for json parsing
app.use(express.json());

// User Routes
app.use('/api/users', userRoutes);

// Post Routes
app.use('/api/posts', postRoutes);

// Comment Routes
app.use('/api/comments', commentRoutes);

// Email Msg Routes
app.use('/api/email', emailMsgRoutes);

// Cateogory Routes
app.use('/api/category', categoryRoutes);


// Not Found Error Handling Middleware
app.use(notFoundError)
// Custom Error Handling Middleware
app.use(errorHandler);

app.get('/', (req, res) => {
    res.send(req.url);
})

// app listing
app.listen(PORT, console.log(`PORT Running at ${PORT}`));