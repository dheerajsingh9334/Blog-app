const passport = require("passport");

const isAuthenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(401).json({
        message: info ? info?.message : "Login required, no token found",
        error: error ? error?.message : undefined,
      });
    }
    //place the user in the req obj - ensure it's a string
    req.user = user?._id?.toString();
    //call next
    return next();
  })(req, res, next);
};

module.exports = isAuthenticated;
