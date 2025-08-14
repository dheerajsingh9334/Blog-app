const asyncHandler = require("express-async-handler");
const Post = require("../../models/Post/Post");
const Comment = require("../../models/Comment/Comment");

const commentsController = {
  //!Create comments
  create: asyncHandler(async (req, res) => {
    const { postId, content, parentCommentId } = req.body;
    
    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Create the comment
    const commentData = {
      content,
      author: req.user,
      post: postId,
    };

    // If this is a reply, add parent comment reference
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
      commentData.parentComment = parentCommentId;
    }

    const commentCreated = await Comment.create(commentData);

    // If this is a reply, add it to the parent comment's replies array
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(
        parentCommentId,
        { $push: { replies: commentCreated._id } }
      );
    }

    // Push the comment to the post
    post.comments.push(commentCreated._id);
    await post.save();

    // Populate author details for response
    await commentCreated.populate('author', 'username profilePicture');

    res.json({
      status: "success",
      message: "Comment created successfully",
      commentCreated,
    });
  }),

  //! Update comment
  update: asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      throw new Error("You can only edit your own comments");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        content,
        isEdited: true
      },
      { new: true }
    ).populate('author', 'username profilePicture');

    res.json({
      status: "success",
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  }),

  //! Delete comment
  delete: asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user is the author or admin
    if (comment.author.toString() !== req.user && req.user.role !== 'admin') {
      throw new Error("You can only delete your own comments");
    }

    // If this comment has replies, just mark it as deleted instead of removing
    if (comment.replies && comment.replies.length > 0) {
      await Comment.findByIdAndUpdate(commentId, {
        content: "[Comment deleted]",
        isDeleted: true
      });
    } else {
      // Remove from parent comment's replies if it's a reply
      if (comment.parentComment) {
        await Comment.findByIdAndUpdate(
          comment.parentComment,
          { $pull: { replies: commentId } }
        );
      }

      // Remove from post's comments
      await Post.findByIdAndUpdate(
        comment.post,
        { $pull: { comments: commentId } }
      );

      // Delete the comment
      await Comment.findByIdAndDelete(commentId);
    }

    res.json({
      status: "success",
      message: "Comment deleted successfully",
    });
  }),

  //! Like/Unlike comment
  toggleLike: asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const isLiked = comment.likes.includes(userId);
    
    if (isLiked) {
      // Unlike
      await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { likes: userId } }
      );
    } else {
      // Like
      await Comment.findByIdAndUpdate(
        commentId,
        { $push: { likes: userId } }
      );
    }

    res.json({
      status: "success",
      message: isLiked ? "Comment unliked" : "Comment liked",
      isLiked: !isLiked,
    });
  }),

  //! Get comment replies
  getReplies: asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const replies = await Comment.find({ parentComment: commentId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: 1 });

    res.json({
      status: "success",
      replies,
    });
  }),
};

module.exports = commentsController;
