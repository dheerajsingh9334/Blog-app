const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../../models/User/User");
const Notification = require("../../models/Notification/Notification");
const Post = require("../../models/Post/Post");
const sendAccVerificationEmail = require("../../utils/sendAccVerificationEmail");
const sendPasswordEmail = require("../../utils/sendPasswordEmail");

//-----User Controller---

const userController = {
  // !Register
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    
    // Check if user already exists (check both username and email separately)
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        throw new Error("Username already exists");
      }
      if (existingUser.email === email) {
        throw new Error("Email already exists");
      }
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Get the free plan from database, fallback to static plan if not found
    const Plan = require("../../models/Plan/Plan");
    let freePlan = await Plan.findOne({ tier: "free", isActive: true });
    
    if (!freePlan) {
      // Fallback to static plan
      const { resolveStaticPlanByIdOrName } = require("../../utils/staticPlans");
      const staticFreePlan = resolveStaticPlanByIdOrName("free");
      if (!staticFreePlan) {
        throw new Error("Free plan not found. Please contact support.");
      }
      // Create the free plan in database for future use
      try {
        freePlan = await Plan.create({
          planName: staticFreePlan.planName,
          description: staticFreePlan.description,
          features: staticFreePlan.features,
          price: staticFreePlan.price,
          postLimit: staticFreePlan.postLimit,
          tier: staticFreePlan.tier,
          isActive: staticFreePlan.isActive
        });
        console.log("✅ Created free plan in database from static plan");
      } catch (createError) {
        console.error("❌ Failed to create free plan in database:", createError.message);
        throw new Error("Free plan not found. Please contact support.");
      }
    }
    
    // Regular user registration only - generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Register the user (only as regular user)
    const userRegistered = await User.create({
      username,
      email,
      password: hashedPassword,
      plan: freePlan._id,
      hasSelectedPlan: true,
      role: "user", // Always create as regular user
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpiry
    });
    
    // Send verification email
    try {
      await sendAccVerificationEmail(email, verificationToken);
      console.log("✅ Verification email sent to:", email);
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", emailError.message);
      // Don't fail registration if email fails, but log it
    }

    // Send admin notification for new user registration
    try {
      const Admin = require("../../models/Admin/Admin");
      const adminUsers = await Admin.find({ isActive: true });
      
      for (const admin of adminUsers) {
        await Notification.create({
          userId: admin._id,
          title: "New User Registration",
          message: `New user ${username} (${email}) has registered`,
          type: "system",
          priority: "medium",
          metadata: {
            actorId: userRegistered._id,
            actorName: username,
            actorEmail: email,
            action: "registered",
            targetType: "user",
            additionalData: {
              registrationTime: new Date(),
              userRole: "user",
              verificationStatus: "pending"
            }
          }
        });
      }
      console.log("✅ Admin notifications sent for new user registration");
    } catch (notificationError) {
      console.error("❌ Failed to send admin notifications for new user:", notificationError);
      // Don't fail registration if notifications fail
    }
    
    // Send the response
    res.status(201).json({
      status: "success",
      message: "User registered successfully. Please check your email for verification.",
      userRegistered: {
        _id: userRegistered._id,
        username: userRegistered.username,
        email: userRegistered.email,
        role: userRegistered.role,
        isEmailVerified: userRegistered.isEmailVerified
      },
    });
  }),
  // ! Login
  login: asyncHandler(async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      //check if user not found
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      //generate token
      const token = jwt.sign({ id: user?._id.toString() }, process.env.JWT_SECRET);
      //set the token into cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, //1 day
      });

      //send the response
      res.json({
        status: "success",
        message: "Login Success",
        username: user?.username,
        email: user?.email,
        _id: user?._id,
        role: user?.role,
        isEmailVerified: user?.isEmailVerified,
      });
    })(req, res, next);
  }),
  // ! googleAuth-->
  googleAuth: passport.authenticate("google", { scope: ["profile"] }),
  // ! GoogleAuthCallback
  googleAuthCallback: asyncHandler(async (req, res, next) => {
    passport.authenticate(
      "google",
      {
        failureRedirect: "/login",
        session: false,
      },
      (err, user, info) => {
        if (err) return next(err);
        if (!user) {
          return res.redirect((process.env.FRONTEND_URL || 'http://localhost:5173') + "/google-login-error");
        }
        //generate the token

        const token = jwt.sign({ id: user?._id.toString() }, process.env.JWT_SECRET, {
          expiresIn: "3d",
        });
        //set the token into the cooke
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000, //1 day:
        });
        //redirect the user dashboard
        res.redirect((process.env.FRONTEND_URL || 'http://localhost:5173') + "/dashboard");
      }
    )(req, res, next);
  }),
  // ! check user authentication status
  checkAuthenticated: asyncHandler(async (req, res) => {
    const token = req.cookies["token"];
    if (!token) {
      return res.status(401).json({ isAuthenticated: false });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //find the user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ isAuthenticated: false });
      } else {
        return res.status(200).json({
          isAuthenticated: true,
          _id: user?._id,
          username: user?.username,
          email: user?.email,
          profilePicture: user?.profilePicture,
          role: user?.role,
          isEmailVerified: user?.isEmailVerified,
        });
      }
    } catch (error) {
      return res.status(401).json({ isAuthenticated: false, error: error.message });
    }
  }),
  // ! Logout
  logout: asyncHandler(async (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }),

  // ! Delete Account
  deleteAccount: asyncHandler(async (req, res) => {
    const { password } = req.body;
    const userId = req.user; // req.user is already the string ID from middleware

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Delete user's notifications
    await Notification.deleteMany({ userId: userId });

    // Delete user's comments
    const Comment = require("../../models/Comment/Comment");
    await Comment.deleteMany({ author: userId });

    // Remove user from other users' followers/following lists
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );

    // Delete the user account (posts will remain)
    await User.findByIdAndDelete(userId);

    // Clear cookies (use the correct cookie name 'token')
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Account deleted successfully. Your posts will remain on the platform.",
    });
  }),
  //! Profile
  profile: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user)
      .populate("followers", "username email profilePicture")
      .populate("following", "username email profilePicture")
      .populate("posts")
      .populate("plan") // Add plan population
      .populate("bannedBy", "username email")
      .select(
        "-password -passwordResetToken -accountVerificationToken -accountVerificationExpires -passwordResetExpires"
      );
    res.json({ user });
  }),
  // !Following
  followUser: asyncHandler(async (req, res) => {
    //1. Find the user who wants to follow user (req.user)
    const userId = req.user;
    //2. Get the user to follow (req.params)
    const followId = req.params.followId;
    
    // Check if the userId and followId are the same
    if (userId === followId) {
      throw new Error("You cannot follow yourself");
    }

    //3. Update the users followers and following arrays
    // Update the user who is following a user
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { following: followId },
      },
      { new: true }
    );
    
    // Update the user who is been followed followers array
    await User.findByIdAndUpdate(
      followId,
      {
        $addToSet: { followers: userId },
      },
      { new: true }
    );

    // Create notification for the user being followed
    try {
      const follower = await User.findById(userId).select('username profilePicture');
      await Notification.create({
        userId: followId,
        title: "New Follower",
        message: `${follower.username} started following you`,
        type: "new_follower",
        metadata: {
          actorId: userId,
          actorName: follower.username,
          actorAvatar: follower.profilePicture,
          action: "followed",
          targetType: "user",
          targetId: followId
        }
      });
    } catch (notificationError) {
      console.error("Failed to create follow notification:", notificationError);
      // Don't fail the follow operation if notification fails
    }

    res.json({
      message: "User followed",
    });
  }),
  // !UnFollowing
  unFollowUser: asyncHandler(async (req, res) => {
    //1. Find the user who wants to follow user (req.user)
    const userId = req.user;
    //2. Get the user to follow (req.params)
    const unfollowId = req.params.unfollowId;
    //Find the users
    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowId);
    if (!user || !unfollowUser) {
      throw new Error("User not found");
    }
    user.following.pull(unfollowId);
    unfollowUser.followers.pull(userId);
    //save the users
    await user.save();
    await unfollowUser.save();
    res.json({
      message: "User unfollowed",
    });
  }),
  //! Verify email acount (token)
  verifyEmailAccount: asyncHandler(async (req, res) => {
    //find the login user
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error("User not found please login");
    }
    // check if user email exists
    if (!user?.email) {
      throw new Error("Email not found");
    }
    //use the method from the model
    const token = await user.generateAccVerificationToken();
    //resave the user
    await user.save();
    //send the email
    sendAccVerificationEmail(user?.email, token);
    res.json({
      message: `Account verification email sent to ${user?.email} token expires in 10 minutes`,
    });
  }),
  //! Verify email account
  verifyEmailAcc: asyncHandler(async (req, res) => {
    //Get the token
    const { verifyToken } = req.params;
    
    //Find the user with the verification token
    const userFound = await User.findOne({
      verificationToken: verifyToken,
      verificationTokenExpiry: { $gt: Date.now() },
    });
    
    if (!userFound) {
      throw new Error("Account verification token is invalid or has expired");
    }

    //Update the user field
    userFound.isEmailVerified = true;
    userFound.verificationToken = null;
    userFound.verificationTokenExpiry = null;
    //resave the user
    await userFound.save();
    res.json({ 
      message: "Account successfully verified",
      user: {
        _id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        role: userFound.role,
        isEmailVerified: userFound.isEmailVerified
      }
    });
  }),

  //! forgot password (sending email token)
  forgotPassword: asyncHandler(async (req, res) => {
    //find the user email
    const { email } = req.body;
    // find the user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`User with email ${email} is not found in our database`);
    }
    //check if user registered with google
    if (user.authMethod !== "local") {
      throw new Error("Please login with your social account");
    }

    //use the method from the model
    const token = await user.generatePasswordResetToken();
    //resave the user
    await user.save();
    //send the email
    sendPasswordEmail(user?.email, token);
    res.json({
      message: `Password reset email sent to ${email}`,
    });
  }),
  //! reset password
  resetPassword: asyncHandler(async (req, res) => {
    const userId = req.user; // or req.user._id if your middleware sets _id
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.json({ message: "Password successfully reset" });
  }),
  //! Change password (requires current password validation)
  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Please provide current and new password",
      });
    }

    // Find the user with password field
    const user = await User.findById(req.user).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  }),
  // update email
  updateEmail: asyncHandler(async (req, res) => {
    //email
    const { email } = req.body;
    //Find the user
    const user = await User.findById(req.user);
    //update the user email
    user.email = email;
    user.isEmailVerified = false;
    //save the user
    await user.save();
    //use the method from the model
    const token = await user.generateAccVerificationToken();
    //send the verification email
    sendAccVerificationEmail(user?.email, token);
    //send the response
    res.json({
      message: `Account verification email sent to ${user?.email} token expires in 10 minutes`,
    });
  }),
  //! Update profile picture
  updateProfilePic: asyncHandler(async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      {
        $set: { profilePicture: req.file },
      },
      { new: true }
    );
    res.json({
      message: "Profile picture updated successfully",
      user: updatedUser, // <-- return updated user
    });
  }),

  //! Update user profile
  updateProfile: asyncHandler(async (req, res) => {
    const { firstName, lastName, bio, contactInfo } = req.body;
    const userId = req.user;

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'profile.firstName': firstName,
          'profile.lastName': lastName,
          'profile.bio': bio,
          'profile.contactInfo': contactInfo
        }
      },
      { new: true }
    ).select('-password -passwordResetToken -accountVerificationToken');

    if (!updatedUser) {
      throw new Error("User not found");
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  }),
  // ! Public profile by ID
getUserProfileById: asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .populate("followers", "username email profilePicture")
    .populate("following", "username email profilePicture")
    .populate("posts")
    .populate("bannedBy", "username email")
    .select(
      "-password -passwordResetToken -accountVerificationToken -accountVerificationExpires -passwordResetExpires"
    );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
}),

  //! Get user's current plan and usage
  getUserPlanAndUsage: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user)
      .populate("plan")
      .populate("posts")
      .select("plan posts totalPosts totalViews totalLikes totalComments");

    if (!user) {
      throw new Error("User not found");
    }

    const currentPostCount = user.posts?.length || 0;
    const userPlan = user.plan;
    
    // Calculate usage and limits
    const usage = {
      posts: {
        current: currentPostCount,
        limit: userPlan?.postLimit || 10, // Default to 10 for free plan
        unlimited: !userPlan?.postLimit
      },
      plan: userPlan || { tier: "free", planName: "Free", postLimit: 10 },
              // Earnings functionality removed
    };

    res.json({ usage });
  }),

  //! Save post
  savePost: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user;

    // Check if post is already saved
    const user = await User.findById(userId);
    if (user.savedPosts.includes(postId)) {
      return res.status(400).json({ message: "Post already saved" });
    }

    // Add post to saved posts
    await User.findByIdAndUpdate(userId, {
      $push: { savedPosts: postId }
    });

    res.status(200).json({ message: "Post saved successfully" });
  }),

  //! Unsave post
  unsavePost: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user;

    // Remove post from saved posts
    await User.findByIdAndUpdate(userId, {
      $pull: { savedPosts: postId }
    });

    res.status(200).json({ message: "Post unsaved successfully" });
  }),

  //! Get saved posts
  getSavedPosts: asyncHandler(async (req, res) => {
    const userId = req.user;

    const user = await User.findById(userId)
      .populate({
        path: 'savedPosts',
        populate: {
          path: 'author',
          select: 'username email profilePicture'
        }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      savedPosts: user.savedPosts,
      count: user.savedPosts.length 
    });
  }),

  //! Get all users for ranking
  getAllUsers: asyncHandler(async (req, res) => {
    try {
      const users = await User.find({})
        .populate("posts", "viewers likes comments")
        .populate("followers", "username email profilePicture")
        .populate("following", "username email profilePicture")
        .select("username email profilePicture posts followers following createdAt")
        .sort({ createdAt: -1 });

      res.json({
        status: "success",
        message: "Users fetched successfully",
        users: users
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch users"
      });
    }
  }),

  //! Get users ranked by most followers
  getUsersByFollowers: asyncHandler(async (req, res) => {
    try {
      const users = await User.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "followers",
            foreignField: "_id",
            as: "followersData"
          }
        },
        {
          $lookup: {
            from: "posts",
            localField: "_id",
            foreignField: "author",
            as: "posts"
          }
        },
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            profilePicture: 1,
            followersCount: { $size: "$followers" },
            postsCount: { $size: "$posts" },
            createdAt: 1
          }
        },
        {
          $sort: { followersCount: -1 }
        },
        {
          $limit: 50
        }
      ]);

      res.json({
        status: "success",
        message: "Users ranked by followers fetched successfully",
        users: users
      });
    } catch (error) {
      console.error("Error fetching users by followers:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch users by followers"
      });
    }
  }),

  //! Get posts ranked by most likes
  getPostsByLikes: asyncHandler(async (req, res) => {
    try {
      const posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorData"
          }
        },
        {
          $unwind: "$authorData"
        },
        {
          $project: {
            _id: 1,
            title: 1,
            content: 1,
            slug: 1,
            likesCount: { $size: "$likes" },
            views: 1,
            commentsCount: { $size: "$comments" },
            createdAt: 1,
            author: {
              _id: "$authorData._id",
              username: "$authorData.username",
              profilePicture: "$authorData.profilePicture"
            }
          }
        },
        {
          $sort: { likesCount: -1 }
        },
        {
          $limit: 50
        }
      ]);

      res.json({
        status: "success",
        message: "Posts ranked by likes fetched successfully",
        posts: posts
      });
    } catch (error) {
      console.error("Error fetching posts by likes:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch posts by likes"
      });
    }
  }),

  //! Get posts ranked by most views
  getPostsByViews: asyncHandler(async (req, res) => {
    try {
      const posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorData"
          }
        },
        {
          $unwind: "$authorData"
        },
        {
          $project: {
            _id: 1,
            title: 1,
            content: 1,
            slug: 1,
            likesCount: { $size: "$likes" },
            views: 1,
            commentsCount: { $size: "$comments" },
            createdAt: 1,
            author: {
              _id: "$authorData._id",
              username: "$authorData.username",
              profilePicture: "$authorData.profilePicture"
            }
          }
        },
        {
          $sort: { views: -1 }
        },
        {
          $limit: 50
        }
      ]);

      res.json({
        status: "success",
        message: "Posts ranked by views fetched successfully",
        posts: posts
      });
    } catch (error) {
      console.error("Error fetching posts by views:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch posts by views"
      });
    }
  }),

};

module.exports = userController;
