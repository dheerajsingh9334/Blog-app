require("dotenv").config();
const corse = require("cors");
const passport = require("./utils/passport-config");
const express = require("express");
const cron = require("node-cron");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/connectDB");
const postRouter = require("./router/post/postsRouter");
const usersRouter = require("./router/user/usersRouter");
const categoriesRouter = require("./router/category/categoriesRouter");
const planRouter = require("./router/plan/planRouter");
const stripePaymentRouter = require("./router/stripePayment/stripePaymentRouter");

const notificationRouter = require("./router/notification/notificationRouter");
const commentRouter = require("./router/comments/commentRouter");
const adminAuthRouter = require("./router/admin/adminAuthRouter");
const adminManagementRouter = require("./router/admin/adminManagementRouter");
// const { profileRouter } = require("./router/user/profile.route");

// Import post controller for scheduled posts
const postController = require("./controllers/posts/postController");
const User = require("./models/User/User");
const Notification = require("./models/Notification/Notification");

//call the db
connectDB();

//Schedule the task to run at 23:59 on the last day of every month
cron.schedule(
  "59 23 * * * ",
  async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (today.getMonth() !== tomorrow.getMonth()) {
      // Earnings functionality removed
    }
  },
  {
    scheduled: true,
    timezone: "America/New_York",
  }
);

// Schedule task to publish scheduled posts every minute
cron.schedule(
  "* * * * *", // Every minute
  async () => {
    try {
      console.log("🕐 Checking for scheduled posts to publish...");
      const now = new Date();
      
      // Import Post model directly here to avoid circular dependencies
      const Post = require("./models/Post/Post");
      const Notification = require("./models/Notification/Notification");
      
      const scheduledPosts = await Post.find({
        status: 'scheduled',
        scheduledFor: { $lte: now },
        isPublic: false
      });

      let publishedCount = 0;
      
      for (const post of scheduledPosts) {
        try {
          await Post.findByIdAndUpdate(post._id, {
            status: 'published',
            publishedAt: now,
            isPublic: true
          });
          
          // Create notification
          await Notification.create({
            userId: post.author,
            postId: post._id,
            title: 'Post Published',
            message: `Your scheduled post "${post.title}" has been published`,
            type: 'system_announcement'
          });
          
          publishedCount++;
          console.log(`✅ Published scheduled post: ${post.title}`);
        } catch (postError) {
          console.error(`❌ Error publishing post ${post._id}:`, postError);
        }
      }

      if (publishedCount > 0) {
        console.log(`✅ Published ${publishedCount} scheduled posts`);
      } else {
        console.log("ℹ️ No scheduled posts to publish");
      }
    } catch (error) {
      console.error("❌ Error in scheduled posts cron job:", error);
    }
  },
  {
    scheduled: true,
    timezone: "America/New_York",
  }
);

// Daily job: deactivate users inactive for 30+ days
cron.schedule(
  "0 2 * * *", // every day at 02:00
  async () => {
    try {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await User.updateMany(
        { lastLogin: { $lt: cutoff }, isBanned: { $ne: true } },
        { $set: { isActive: false } }
      );
      if (result.modifiedCount > 0) {
        console.log(`⚠️ Deactivated ${result.modifiedCount} inactive user accounts`);
      }
    } catch (err) {
      console.error("❌ Error deactivating inactive users:", err);
    }
  },
  { scheduled: true, timezone: "America/New_York" }
);

const app = express();
//! PORT
const PORT = 5000;

//Middlewares
app.use(express.json()); //Pass json data
// corse middleware
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};
app.use(corse(corsOptions));
// Passport middleware
app.use(passport.initialize());
app.use(cookieParser()); //automattically parses the cookie
//!---Route handlers
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/plans", planRouter);
app.use("/api/v1/stripe", stripePaymentRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin", adminManagementRouter);
// app.use("/api/profile", profileRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Backend server is running",
    timestamp: new Date().toISOString()
  });
});

//!Not found
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found on our server" });
});
//! Error handdling middleware
app.use((err, req, res, next) => {
  //prepare the error message
  const message = err.message;
  const stack = err.stack;
  res.status(500).json({
    message,
    stack,
  });
});

//!Start the server
app.listen(PORT, console.log(`Server is up and running on port ${PORT}`));
