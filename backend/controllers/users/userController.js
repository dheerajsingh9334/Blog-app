const passport = require('passport');
const User = require('../../models/User.model')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs");
const LocalStrategy = require('passport-local').Strategy;

// userController
const userController = {
  //! Register
  register: async (req, res) => {
    const { userName, email, password } = req.body;
    try {
      const userFound = await User.findOne({
        $or: [{ email }, { userName: username }]
      });
      if (userFound) {
        throw new Error("User already exists");
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      // user registration
      const userRegister = await User.create({
        userName,
        email,
        password: hashedPassword,
      });
      res.status(201).json({
        status: "success",
        message: "User Registerd Successfuly",
        userRegister
      });

    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: error.message });
    };
  },

  //!Login
  login: async (req, res, next) => {
    try {
      passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        // console.log(user);

        // check if user not found
        if (!user) {
          return res.status(400).json({ message: info.message })
        }
        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
       
        // set token into cookie
        res.cookie("token", token,{
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,// 7 days
cd
        });
        //  console.log(token)
         //cookie same as token
         //Send the response 
         res.json({
          _id:user._id,
          status:"success",
          message:"login success",
          username:user.username,
          email:user.email,
         });
      })(req, res, next);
    } catch (error) {
      //   console.error('Login error:', error);
      //   res.status(500).json({ message: 'Server error during login' });
    }
  },
  //!googleAuth -->
  googleAuth:passport.authenticate('google',{scope:['profile','email']}),
  //!GoogleAuthcallback
  googleAuthcallback:async(req,res,next)=>{
    passport.authenticate("google",
      {
         failureRedirect:"/login",
         session:false,
      },(err,user,info) =>{
        if(err) return next(err);
      
        if(!user){
          return res.redirect("http://localhost:5173/google-login-error");
        }

        const token = jwt.sign({id:user.id},process.env.JWT_SECRET,{
          expiresIn:"3d",
        });
        // set the token into code
        res.cookie('token',token,{
          httpOnly:true,
          secure:false,
          sameSite:"Strict",
          maxAge:24*60*60*1000 // 1 Day;
        })
        console.log("Redirecting to dashboard...");

        // redirect to user dashboard
         console.log("Redirecting to dashboard...");
        res.redirect("http://localhost:5173/dashboard")
      })(req,res,next)
  },

    //! CHECK User authentication  status
    checkAuthenticated: async(req,res) =>{
     const token = req.cookies['token'];
     if(!token){
      return res.status(401).json({isAuthenticated:false})
     }
     try{
      const decode = jwt.verify(token,process.env.JWT_SECRET)
      // console.log("decode",decode);
      // find the id
      const user = await User.findById(decode.id)
      // console.log(user)
      if(!user){
        return res.status(401).json({isAuthenticated:false});
      }else{
        return res.status(200).json({
          isAuthenticated:true,
          _id:user._id,
          username:user.userName,
          profilepicture:user.profilePicture,
        })
      }
     }catch(error){
  return res.status(401).json({isAuthenticated:false,error});
     }
    },
    //!Logiut
    logout:async(req,res) =>{
      res.cookie('token','',{maxAge:1});
      res.status(200).json({message:"logout success"})
    }
};

module.exports = userController;