const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User/User");
const Post = require("../models/Post/Post");
const Category = require("../models/Category/Category");
require("dotenv").config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// User data
const usersData = [
  { name: "Aarav Sharma", username: "aarav.sharma", email: "aarav.sharma@example.com", password: "123456" },
  { name: "Priya Iyer", username: "priya.iyer", email: "priya.iyer@example.com", password: "123456" },
  { name: "Rohan Mehta", username: "rohan.mehta", email: "rohan.mehta@example.com", password: "123456" },
  { name: "Ananya Verma", username: "ananya.verma", email: "ananya.verma@example.com", password: "123456" },
  { name: "Arjun Nair", username: "arjun.nair", email: "arjun.nair@example.com", password: "123456" },
  { name: "Sneha Kapoor", username: "sneha.kapoor", email: "sneha.kapoor@example.com", password: "123456" },
  { name: "Karan Malhotra", username: "karan.malhotra", email: "karan.malhotra@example.com", password: "123456" },
  { name: "Neha Reddy", username: "neha.reddy", email: "neha.reddy@example.com", password: "123456" },
  { name: "Vikram Joshi", username: "vikram.joshi", email: "vikram.joshi@example.com", password: "123456" },
  { name: "Pooja Deshmukh", username: "pooja.deshmukh", email: "pooja.deshmukh@example.com", password: "123456" }
];

// Categories data
const categoriesData = [
  { categoryName: "Technology", description: "Latest tech trends, programming, and innovation" },
  { categoryName: "Travel", description: "Travel guides, experiences, and destinations" },
  { categoryName: "Food", description: "Recipes, restaurant reviews, and culinary adventures" },
  { categoryName: "Health & Fitness", description: "Wellness tips, exercise routines, and healthy living" },
  { categoryName: "Lifestyle", description: "Daily life tips, productivity, and personal development" },
  { categoryName: "Business", description: "Entrepreneurship, finance, and business strategies" },
  { categoryName: "Entertainment", description: "Movies, music, games, and pop culture" },
  { categoryName: "Education", description: "Learning resources, tutorials, and academic content" },
  { categoryName: "Sports", description: "Sports news, analysis, and athletic pursuits" },
  { categoryName: "Fashion", description: "Style trends, fashion tips, and designer insights" }
];

// Posts data with different tags for each category
const postsData = [
  {
    title: "The Future of Artificial Intelligence in 2025",
    description: "Exploring the latest developments in AI technology and their impact on society.",
    content: "Artificial Intelligence continues to evolve at an unprecedented pace. From machine learning to neural networks, the possibilities are endless...",
    tags: ["ai", "machine-learning", "technology", "future", "innovation"],
    categoryName: "Technology",
    excerpt: "A comprehensive look at AI developments and their societal impact."
  },
  {
    title: "Hidden Gems: Exploring Rajasthan's Lesser-Known Destinations",
    description: "Discover the unexplored beauty of Rajasthan beyond the popular tourist spots.",
    content: "While Jaipur and Udaipur attract millions of visitors, Rajasthan has many hidden treasures waiting to be discovered...",
    tags: ["rajasthan", "travel", "hidden-gems", "india", "adventure"],
    categoryName: "Travel",
    excerpt: "Uncover Rajasthan's best-kept secrets and off-the-beaten-path destinations."
  },
  {
    title: "Authentic Indian Street Food: A Culinary Journey",
    description: "Exploring the diverse and delicious world of Indian street food across different regions.",
    content: "From Mumbai's vada pav to Delhi's chaat, Indian street food offers an incredible variety of flavors...",
    tags: ["street-food", "indian-cuisine", "food", "recipes", "culture"],
    categoryName: "Food",
    excerpt: "A flavorful exploration of India's diverse street food culture."
  },
  {
    title: "Yoga for Beginners: Building a Sustainable Practice",
    description: "A comprehensive guide to starting your yoga journey with proper form and mindfulness.",
    content: "Yoga is more than just physical exercise; it's a holistic approach to wellness that combines body, mind, and spirit...",
    tags: ["yoga", "fitness", "wellness", "meditation", "health"],
    categoryName: "Health & Fitness",
    excerpt: "Start your yoga journey with this beginner-friendly guide to sustainable practice."
  },
  {
    title: "Minimalism: The Art of Living with Less",
    description: "How adopting a minimalist lifestyle can lead to greater happiness and productivity.",
    content: "In a world of constant consumption, minimalism offers a different path - one focused on intentionality and purpose...",
    tags: ["minimalism", "lifestyle", "productivity", "mindfulness", "simplicity"],
    categoryName: "Lifestyle",
    excerpt: "Discover how minimalism can transform your life and increase your happiness."
  },
  {
    title: "Startup Success: Lessons from India's Unicorns",
    description: "Analyzing the strategies and decisions that led to the success of Indian unicorn startups.",
    content: "India's startup ecosystem has produced numerous unicorns, each with unique stories of innovation and perseverance...",
    tags: ["startups", "business", "entrepreneurship", "unicorns", "india"],
    categoryName: "Business",
    excerpt: "Learn from the success stories of India's most valuable startups."
  },
  {
    title: "Bollywood's Evolution: From Classic to Contemporary",
    description: "Tracing the transformation of Indian cinema over the decades.",
    content: "Bollywood has come a long way from its golden age classics to today's diverse storytelling approaches...",
    tags: ["bollywood", "cinema", "entertainment", "movies", "culture"],
    categoryName: "Entertainment",
    excerpt: "Explore the evolution of Bollywood and its impact on Indian culture."
  },
  {
    title: "Learning Python: A Complete Beginner's Guide",
    description: "Master Python programming with this comprehensive tutorial for absolute beginners.",
    content: "Python is one of the most popular programming languages today, known for its simplicity and versatility...",
    tags: ["python", "programming", "coding", "tutorial", "education"],
    categoryName: "Education",
    excerpt: "Start your programming journey with this complete Python tutorial."
  },
  {
    title: "Cricket World Cup 2023: India's Road to Victory",
    description: "Analyzing India's performance and strategies in the recent Cricket World Cup.",
    content: "The Cricket World Cup 2023 showcased some exceptional performances, with India leading the way...",
    tags: ["cricket", "sports", "world-cup", "india", "analysis"],
    categoryName: "Sports",
    excerpt: "A detailed analysis of India's cricket performance and strategies."
  },
  {
    title: "Sustainable Fashion: The Future of Style",
    description: "How sustainable fashion is reshaping the industry and consumer choices.",
    content: "The fashion industry is undergoing a significant transformation towards sustainability and ethical practices...",
    tags: ["sustainable-fashion", "style", "eco-friendly", "fashion", "ethics"],
    categoryName: "Fashion",
    excerpt: "Discover how sustainable fashion is changing the style landscape."
  }
];

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Category.deleteMany({});
    console.log("Existing data cleared");
  } catch (error) {
    console.error("Error clearing data:", error);
  }
};

// Create users
const createUsers = async () => {
  try {
    const users = [];
    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        authMethod: "local",
        isEmailVerified: true
      });
      const savedUser = await user.save();
      users.push(savedUser);
    }
    console.log("Users created successfully");
    return users;
  } catch (error) {
    console.error("Error creating users:", error);
    return [];
  }
};

// Create categories
const createCategories = async (users) => {
  try {
    const categories = [];
    for (let i = 0; i < categoriesData.length; i++) {
      const categoryData = categoriesData[i];
      const author = users[i % users.length]; // Rotate through users
      
      const category = new Category({
        categoryName: categoryData.categoryName,
        description: categoryData.description,
        author: author._id
      });
      
      const savedCategory = await category.save();
      categories.push(savedCategory);
    }
    console.log("Categories created successfully");
    return categories;
  } catch (error) {
    console.error("Error creating categories:", error);
    return [];
  }
};

// Create posts
const createPosts = async (users, categories) => {
  try {
    const posts = [];
    
    for (let i = 0; i < postsData.length; i++) {
      const postData = postsData[i];
      const author = users[i % users.length]; // Rotate through users
      const category = categories.find(cat => cat.categoryName === postData.categoryName);
      
      if (!category) {
        console.log(`Category ${postData.categoryName} not found, skipping post`);
        continue;
      }
      
      const post = new Post({
        title: postData.title,
        description: postData.description,
        content: postData.content,
        author: author._id,
        category: category._id,
        tags: postData.tags,
        excerpt: postData.excerpt,
        status: "published",
        isPublic: true,
        publishedAt: new Date(),
        viewsCount: Math.floor(Math.random() * 1000) + 50, // Random views between 50-1050
        readingTimeMinutes: Math.floor(Math.random() * 10) + 3 // Random reading time 3-12 minutes
      });
      
      const savedPost = await post.save();
      posts.push(savedPost);
      
      // Update user's posts array
      await User.findByIdAndUpdate(author._id, {
        $push: { posts: savedPost._id },
        $inc: { totalPosts: 1 }
      });
      
      // Update category's posts array
      await Category.findByIdAndUpdate(category._id, {
        $push: { posts: savedPost._id }
      });
    }
    
    console.log("Posts created successfully");
    return posts;
  } catch (error) {
    console.error("Error creating posts:", error);
    return [];
  }
};

// Create follow relationships
const createFollowRelationships = async (users) => {
  try {
    // Each user will follow 3-5 random other users
    for (const user of users) {
      const otherUsers = users.filter(u => u._id.toString() !== user._id.toString());
      const numToFollow = Math.floor(Math.random() * 3) + 3; // 3-5 follows
      
      // Randomly select users to follow
      const shuffled = otherUsers.sort(() => 0.5 - Math.random());
      const usersToFollow = shuffled.slice(0, numToFollow);
      
      const followingIds = usersToFollow.map(u => u._id);
      
      // Update the user's following list
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { following: { $each: followingIds } }
      });
      
      // Update followers list for each followed user
      for (const followedUser of usersToFollow) {
        await User.findByIdAndUpdate(followedUser._id, {
          $addToSet: { followers: user._id }
        });
      }
    }
    
    console.log("Follow relationships created successfully");
  } catch (error) {
    console.error("Error creating follow relationships:", error);
  }
};

// Add some likes and comments to posts
const addInteractions = async (users, posts) => {
  try {
    for (const post of posts) {
      // Random likes (30-70% of users will like each post)
      const likersCount = Math.floor(Math.random() * (users.length * 0.4)) + Math.floor(users.length * 0.3);
      const shuffledUsers = users.sort(() => 0.5 - Math.random());
      const likers = shuffledUsers.slice(0, likersCount);
      
      await Post.findByIdAndUpdate(post._id, {
        $addToSet: { likes: { $each: likers.map(u => u._id) } }
      });
      
      // Random views (higher than likes)
      const additionalViews = Math.floor(Math.random() * 500) + 100;
      await Post.findByIdAndUpdate(post._id, {
        $inc: { viewsCount: additionalViews }
      });
    }
    
    console.log("Post interactions added successfully");
  } catch (error) {
    console.error("Error adding interactions:", error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log("Starting database seeding...");
    
    // Clear existing data
    await clearData();
    
    // Create users
    const users = await createUsers();
    if (users.length === 0) {
      console.error("Failed to create users. Exiting...");
      return;
    }
    
    // Create categories
    const categories = await createCategories(users);
    if (categories.length === 0) {
      console.error("Failed to create categories. Exiting...");
      return;
    }
    
    // Create posts
    const posts = await createPosts(users, categories);
    if (posts.length === 0) {
      console.error("Failed to create posts. Exiting...");
      return;
    }
    
    // Create follow relationships
    await createFollowRelationships(users);
    
    // Add interactions
    await addInteractions(users, posts);
    
    console.log("\n=== Database Seeding Completed Successfully! ===");
    console.log(`Created ${users.length} users`);
    console.log(`Created ${categories.length} categories`);
    console.log(`Created ${posts.length} posts`);
    console.log("Follow relationships established");
    console.log("Post interactions added");
    
    // Display some stats
    console.log("\n=== Sample Data Overview ===");
    console.log("Users:", users.map(u => u.username).join(", "));
    console.log("Categories:", categories.map(c => c.categoryName).join(", "));
    console.log("Sample Tags:", [...new Set(posts.flatMap(p => p.tags))].slice(0, 10).join(", "));
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
