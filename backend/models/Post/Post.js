const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    content: { type: String, trim: true }, // Made optional since it's redundant with description
    image: {
      type: Object,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nextEarningDate: {
      type: Date,
      default: () =>
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // Default to the first day of the next month
    },
    lastCalculatedViewsCount: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Tags for better organization and discovery
    tags: [{ 
      type: String, 
      trim: true,
      lowercase: true,
      maxlength: 20 
    }],
    // Post status and scheduling
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'published', // Changed from 'draft' to 'published'
      validate: {
        validator: function(v) {
          return ['draft', 'published', 'scheduled', 'archived'].includes(v);
        },
        message: props => `${props.value} is not a valid status!`
      }
    },
    publishedAt: {
      type: Date,
      default: () => new Date() // Default to current date
    },
    scheduledFor: {
      type: Date,
      default: null
    },
    isPublic: {
      type: Boolean,
      default: true // Changed from false to true
    },
    viewsCount: { type: Number, default: 0 },
    // Interactions
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Comments
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    // Flag for moderation
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for better search performance
postSchema.index({ title: 'text', description: 'text', content: 'text', tags: 'text' });
postSchema.index({ status: 1, publishedAt: 1 });
postSchema.index({ scheduledFor: 1, status: 1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model("Post", postSchema);
