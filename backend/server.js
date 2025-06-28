const express = require('express');
const app = express();
const Post = require("./models/Post");
const  postRouter = require('./router/post/postsRouter');
const connectDB = require('./utils/connectDB');
require('dotenv').config();
const cors = require('cors');
const userRouter = require('./router/user/usersRouter');
const passport = require('./utils/passport-config');
const cookieParser = require('cookie-parser');


const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// corse middleware
const corsOptions = {
    origin: ['http://localhost:5173'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(cookieParser());// autematically parser the cookie

// passport middleware
app.use(passport.initialize())


// !Connect to DB
connectDB();
//!-----Route Handler----
app.use('/api/blogs',postRouter)
app.use('/api/blogs/users',userRouter)

//!Not found
app.use((req,res,next)=>{
    res.status(404).json({message:'Route not Found on Server'})
})
// !Error handling middleware
app.use((err,req,res,next)=>{
    const message = err.message
    const stack = err.stack
    console.log(message);
    res.status(500).json({message,stack})
    
})

//! Start Server
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
// http://localhost:5000/api/users/auth/google/callback