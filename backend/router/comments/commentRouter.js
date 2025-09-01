const express = require("express");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const isAccountVerified = require("../../middlewares/isAccountVerified");
const checkUserBan = require("../../middlewares/checkUserBan");
const { commentRateLimiter } = require("../../middlewares/rateLimiter");
const commentsController = require("../../controllers/comments/commentsController");

const commentRouter = express.Router();

//-----Create comment----
commentRouter.post("/create", isAuthenticated, isAccountVerified, checkUserBan, commentRateLimiter, commentsController.create);

//-----Update comment----
commentRouter.put("/:commentId", isAuthenticated, isAccountVerified, checkUserBan, commentRateLimiter, commentsController.update);

//-----Delete comment----
commentRouter.delete("/:commentId", isAuthenticated, isAccountVerified, commentsController.delete);

//-----Like/Unlike comment----
commentRouter.post("/:commentId/like", isAuthenticated, isAccountVerified, checkUserBan, commentRateLimiter, commentsController.toggleLike);

//-----Get comment replies----
commentRouter.get("/:commentId/replies", commentsController.getReplies);

module.exports = commentRouter;
