const mongoose = require("mongoose");
const Post = require("../models/Post/Post");
const connectDB = require("./connectDB");

const updateExistingPosts = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to database");

    // Find all posts that don't have status or isPublic fields
    const postsToUpdate = await Post.find({
      $or: [
        { status: { $exists: false } },
        { isPublic: { $exists: false } }
      ]
    });

    console.log(`Found ${postsToUpdate.length} posts to update`);

    if (postsToUpdate.length > 0) {
      // Update all posts to have published status and be public
      const updateResult = await Post.updateMany(
        {
          $or: [
            { status: { $exists: false } },
            { isPublic: { $exists: false } }
          ]
        },
        {
          $set: {
            status: 'published',
            isPublic: true,
            publishedAt: new Date()
          }
        }
      );

      console.log(`✅ Updated ${updateResult.modifiedCount} posts`);
    }

    // Also update posts with draft status to published if they have content
    const draftPosts = await Post.find({ status: 'draft' });
    if (draftPosts.length > 0) {
      const draftUpdateResult = await Post.updateMany(
        { status: 'draft' },
        {
          $set: {
            status: 'published',
            isPublic: true,
            publishedAt: new Date()
          }
        }
      );

      console.log(`✅ Updated ${draftUpdateResult.modifiedCount} draft posts to published`);
    }

    console.log("✅ All posts updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating posts:", error);
    process.exit(1);
  }
};

// Run the script
updateExistingPosts();
