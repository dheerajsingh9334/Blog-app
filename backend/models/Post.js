const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  // title: {
  //   type: String,
  //   required: true,
  //   trim: true
  // },
    description:{
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: Object
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  // Optional: For threaded posts or replies
  parentPost: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
  },
  nextEarningDate: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
  },
  thisMonthEarning: { type: Number, default: 0 },
  totalEarning: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

  // Interaction
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  disLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Comments
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],

  // Moderation
  isBlocked: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
