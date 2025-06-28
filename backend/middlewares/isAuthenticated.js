const passport = require("passport")


const isAuthenticated = (req,res,next) =>{
passport.authenticate('jwt',{session:false},(error,user,info)=>{
    console.log({
        error,user,info
    });
    
})(req,res,next)
}
module.exports = isAuthenticated;