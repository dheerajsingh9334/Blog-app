const Post = require("../models/Post/Post");

const fixPostStatus = async () => {
  try {
    console.log("🔧 Starting post status fix...");
    
    // Find posts with missing required fields
    const postsWithIssues = await Post.find({
      $or: [
        { title: { $exists: false } },
        { title: null },
        { title: "" },
        { description: { $exists: false } },
        { description: null },
        { description: "" },
        { author: { $exists: false } },
        { author: null }
      ]
    });

    console.log(`Found ${postsWithIssues.length} posts with missing required fields`);

    for (const post of postsWithIssues) {
      console.log(`Fixing post ${post._id}`);
      
      // Set default values for missing fields
      if (!post.title || post.title === "") {
        post.title = "Untitled Post";
        console.log(`  - Set title to "Untitled Post"`);
      }
      
      if (!post.description || post.description === "") {
        post.description = "No description available";
        console.log(`  - Set description to "No description available"`);
      }
      
      if (!post.author) {
        console.log(`  - Post ${post._id} has no author, skipping...`);
        continue; // Skip posts without author as we can't assign one
      }
      
      // Ensure status is set
      if (!post.status) {
        post.status = "published";
        console.log(`  - Set status to "published"`);
      }
      
      // Ensure publishedAt is set for published posts
      if (post.status === "published" && !post.publishedAt) {
        post.publishedAt = post.createdAt || new Date();
        console.log(`  - Set publishedAt to ${post.publishedAt}`);
      }
      
      // Save the fixed post
      await post.save();
      console.log(`  ✅ Post ${post._id} fixed and saved`);
    }

    console.log("✅ Post status fix completed successfully!");
  } catch (err) {
    console.error("❌ Error in fixPostStatus():", err.message);
  }
};

module.exports = fixPostStatus;
