const asyncHandler = require("express-async-handler");
const Post = require("../../models/Post/Post");
const Comment = require("../../models/Comment/Comment");
const User = require("../../models/User/User");
const Notification = require("../../models/Notification/Notification");

const commentsController = {
  //!Create comments
  create: asyncHandler(async (req, res) => {
    const { postId, content, parentCommentId } = req.body;
    
    // Find the post
    const post = await Post.findById(postId).populate('author', 'email isEmailVerified username');
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

    // Create notification and send email for new comment
    try {
      if (post.author._id.toString() !== req.user) { // Don't notify if commenting on own post
        const commenter = await User.findById(req.user).select('username profilePicture');
        
        // Create notification
        await Notification.create({
          userId: post.author._id,
          title: "New Comment",
          message: `${commenter.username} commented on your post "${post.title}"`,
          type: "new_comment",
          metadata: {
            actorId: req.user,
            actorName: commenter.username,
            actorAvatar: commenter.profilePicture,
            action: "commented",
            targetType: "post",
            targetId: postId,
            postTitle: post.title,
            commentContent: content.substring(0, 100) + (content.length > 100 ? '...' : '')
          }
        });

        // Send email notification if post author has verified email
        if (post.author.isEmailVerified && post.author.email) {
          const { sendCommentNotificationEmail } = require("../utils/sendNotificationEmails");
          await sendCommentNotificationEmail(post.author, commenter, post, { content, _id: commentCreated._id });
        }
      }
    } catch (notificationError) {
      console.error("Failed to create comment notification:", notificationError);
      // Don't fail the comment operation if notification fails
    }

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
    
    console.log('🗑️ Delete comment request received');
    console.log('Comment ID:', commentId);
    console.log('User ID from token:', req.user);

    if (!req.user) {
      console.log('❌ No user ID found in request');
      throw new Error("Authentication required");
    }

    // Get user details to check role
    const User = require("../../models/User/User");
    const currentUser = await User.findById(req.user);
    if (!currentUser) {
      console.log('❌ User not found');
      throw new Error("User not found");
    }

    console.log('👤 Current user:', currentUser.username, 'Role:', currentUser.role);

    const comment = await Comment.findById(commentId);
    if (!comment) {
      console.log('❌ Comment not found');
      throw new Error("Comment not found");
    }

    console.log('📝 Found comment:');
    console.log('- Comment author:', comment.author.toString());
    console.log('- Request user:', req.user);
    console.log('- Authors match:', comment.author.toString() === req.user);
    console.log('- User is admin:', currentUser.role === 'admin');

    // Check if user is the author or admin
    if (comment.author.toString() !== req.user && currentUser.role !== 'admin') {
      console.log('❌ Authorization failed - user cannot delete this comment');
      throw new Error("You can only delete your own comments");
    }

    console.log('✅ Authorization passed - proceeding with deletion');

    console.log('✅ Authorization passed - proceeding with deletion');

    // If this comment has replies, just mark it as deleted instead of removing
    if (comment.replies && comment.replies.length > 0) {
      console.log('🔄 Comment has replies, marking as deleted...');
      await Comment.findByIdAndUpdate(commentId, {
        content: "[Comment deleted]",
        isDeleted: true
      });
      console.log('✅ Comment marked as deleted');
    } else {
      console.log('🗑️ Comment has no replies, removing completely...');
      
      // Remove from parent comment's replies if it's a reply
      if (comment.parentComment) {
        console.log('📤 Removing from parent comment replies...');
        await Comment.findByIdAndUpdate(
          comment.parentComment,
          { $pull: { replies: commentId } }
        );
      }

      // Remove from post's comments
      console.log('📤 Removing from post comments...');
      await Post.findByIdAndUpdate(
        comment.post,
        { $pull: { comments: commentId } }
      );

      // Delete the comment
      console.log('🗑️ Deleting comment from database...');
      await Comment.findByIdAndDelete(commentId);
      console.log('✅ Comment completely removed');
    }

    console.log('✅ Comment deletion completed successfully');
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
