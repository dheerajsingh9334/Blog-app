import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaHeart, FaReply, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
import Avatar from "../User/Avatar";
import { useFormik } from "formik";
import * as Yup from "yup";
import { 
  createCommentAPI, 
  updateCommentAPI, 
  deleteCommentAPI, 
  toggleCommentLikeAPI 
} from "../../APIServices/comments/commentsAPI";

const CommentItem = ({
  comment,
  currentUserId,
  onReply,
  level = 0,
  onCommentUpdate,
  postId
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (commentId) => {
      return await toggleCommentLikeAPI(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-details"] });
      if (onCommentUpdate) onCommentUpdate();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ commentId, content }) => {
      return await updateCommentAPI(commentId, { content });
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["post-details"] });
      if (onCommentUpdate) onCommentUpdate();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId) => {
      return await deleteCommentAPI(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-details"] });
      if (onCommentUpdate) onCommentUpdate();
    }
  });

  // Check if current user liked the comment
  const isLiked = comment.likes?.some(like => like._id === currentUserId || like === currentUserId);
  const isAuthor = comment.author?._id === currentUserId;
  const hasReplies = comment.replies && comment.replies.length > 0;

  // Handle like/unlike
  const handleLike = async () => {
    if (!currentUserId) return;
    await likeMutation.mutateAsync(comment._id);
  };

  // Handle reply
  const handleReply = () => {
    if (!currentUserId) return;
    setIsReplying(true);
    onReply(comment._id);
  };

  // Handle edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteMutation.mutateAsync(comment._id);
    }
  };

  // Edit form
  const editFormik = useFormik({
    initialValues: { content: comment.content },
    validationSchema: Yup.object({
      content: Yup.string()
        .min(1, "Comment cannot be empty")
        .max(1000, "Comment is too long")
        .required("Comment content is required"),
    }),
    onSubmit: async (values) => {
      await updateMutation.mutateAsync({
        commentId: comment._id,
        content: values.content
      });
    },
  });

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
        {/* Comment Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar user={comment.author} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 dark:text-white">
                {comment.author?.username || "Anonymous"}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  (edited)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Comment Content */}
        <div className="ml-12">
          {isEditing ? (
            <form onSubmit={editFormik.handleSubmit} className="space-y-3">
              <textarea
                {...editFormik.getFieldProps("content")}
                rows="3"
                className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg dark:bg-gray-700 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Edit your comment..."
              />
              {editFormik.touched.content && editFormik.errors.content && (
                <div className="text-red-500 text-sm">{editFormik.errors.content}</div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <FaCheck className="h-3 w-3" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                >
                  <FaTimes className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-800 dark:text-gray-200 mb-3">
              {comment.content}
            </p>
          )}

          {/* Comment Actions */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending || !currentUserId}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                isLiked
                  ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              } ${!currentUserId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <FaHeart className={`h-3 w-3 ${isLiked ? "fill-current" : ""}`} />
              <span>{comment.likes?.length || 0}</span>
            </button>

            <button
              onClick={handleReply}
              disabled={!currentUserId}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                !currentUserId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <FaReply className="h-3 w-3" />
              Reply
            </button>

            {isAuthor && (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <FaEdit className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FaTrash className="h-3 w-3" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <CommentReplyForm
                postId={postId}
                parentCommentId={comment._id}
                onCancel={() => setIsReplying(false)}
                onSuccess={() => {
                  setIsReplying(false);
                  // Invalidate queries to refresh the comment data
                  queryClient.invalidateQueries({ queryKey: ["post-details"] });
                  if (onCommentUpdate) onCommentUpdate();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2"
          >
            {showReplies ? "Hide" : "Show"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </button>

          {showReplies && (
            <div>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  level={level + 1}
                  onCommentUpdate={onCommentUpdate}
                  postId={postId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Reply Form Component
const CommentReplyForm = ({ postId, parentCommentId, onCancel, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues: { content: "" },
    validationSchema: Yup.object({
      content: Yup.string()
        .min(1, "Reply cannot be empty")
        .max(1000, "Reply is too long")
        .required("Reply content is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (isSubmitting) return; // Prevent double submission
      
      setIsSubmitting(true);
      try {
        await createCommentAPI({
          postId,
          content: values.content,
          parentCommentId
        });
        resetForm();
        // Only call onSuccess once after successful submission
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Failed to post reply:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-3">
      <textarea
        {...formik.getFieldProps("content")}
        rows="2"
        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg dark:bg-gray-800 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Write a reply..."
      />
      {formik.touched.content && formik.errors.content && (
        <div className="text-red-500 text-sm">{formik.errors.content}</div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Posting..." : "Post Reply"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CommentItem;













