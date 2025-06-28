const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../models/User.model');
const bcrypt = require('bcryptjs');
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require('../models/User.model');
const mongoose = require('mongoose'); // Added mongoose import

//! Local Strategy (unchanged)
passport.use(
    new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, async (username, password, done) => {
        try {
            const user = await UserModel.findOne({ userName: username });
            if (!user) {
                return done(null, false, { message: "No user with that username" });
            }
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                return done(null, user);
            } else {
                return done(null, false, { message: "invalid password" });
            }
        } catch (error) {
            return done(error);
        }
    })
);

// JWT Options (unchanged)
const options = {
    jwtFromRequest: ExtractJWT.fromExtractors([(req) => {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies['token'];
        }
        return token;
    }]),
    secretOrKey: process.env.JWT_SECRET
};

//! FIXED JWT Strategy (main change)
passport.use(
    new JWTStrategy(options, async (jwt_payload, done) => {
        try {
            // Changed from User.findOne(userDecoded.id) to:
            const user = await User.findOne({ 
                _id: new mongoose.Types.ObjectId(jwt_payload.id) // Fixed ObjectId creation
            });
            
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            console.error('JWT Verification Error:', error); // Added error logging
            return done(error, false);
        }
    })
);

//! Google OAuth (unchanged)
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/blogs/users/auth/google/callback'
    }, async (accessToken, refreshtoken, profile, done) => {
        try {
            let user = await User.findOne({
                $or: [
                    { googleId: profile.id },
                    { email: profile.emails?.[0]?.value }
                ]
            });

            const { id, displayName, _json: { picture } } = profile;
            let email = "";
            
            if (Array.isArray(profile.emails) && profile.emails.length > 0) {
                email = profile.emails[0].value;
            }

            if (!user) {
                user = await User.create({
                    userName: displayName,
                    googleId: id,
                    profilePicture: picture,
                    authMethod: "google",
                    email
                });
            }
            
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    })
);

module.exports = passport;