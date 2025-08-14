const mongoose = require("mongoose");
require("../models/User/User"); // Import User model first
require("../models/Category/Category"); // Import Category model
require("../models/Post/Post"); // Import Post model

// Simple connection without environment variables for testing
const checkPosts = async () => {
  try {
    // Try to connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/user-dashboard");
    console.log("✅ Connected to database");

    // Get the Post model after connection
    const Post = mongoose.model("Post");

    // Check all posts
    const allPosts = await Post.find({}).populate("author", "username").populate("category", "categoryName");
    console.log(`\n📊 Found ${allPosts.length} total posts in database:`);
    
    allPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. Post ID: ${post._id}`);
      console.log(`   Title: ${post.title || 'No title'}`);
      console.log(`   Author: ${post.author?.username || 'No author'}`);
      console.log(`   Status: ${post.status || 'No status'}`);
      console.log(`   isPublic: ${post.isPublic}`);
      console.log(`   Created: ${post.createdAt}`);
      console.log(`   Category: ${post.category?.categoryName || 'No category'}`);
    });

    // Check posts by status
    const publishedPosts = await Post.find({ status: 'published' });
    const draftPosts = await Post.find({ status: 'draft' });
    const noStatusPosts = await Post.find({ status: { $exists: false } });
    
    console.log(`\n📈 Posts by status:`);
    console.log(`   Published: ${publishedPosts.length}`);
    console.log(`   Drafts: ${draftPosts.length}`);
    console.log(`   No status: ${noStatusPosts.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

// Run the script
checkPosts();
