const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    // Add support for nested replies
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },
    replies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
