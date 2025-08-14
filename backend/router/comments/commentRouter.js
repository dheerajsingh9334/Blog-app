const express = require("express");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const checkUserBan = require("../../middlewares/checkUserBan");
const { commentRateLimiter } = require("../../middlewares/rateLimiter");
const commentsController = require("../../controllers/comments/commentsController");

const commentRouter = express.Router();

//-----Create comment----
commentRouter.post("/create", isAuthenticated, checkUserBan, commentRateLimiter, commentsController.create);

//-----Update comment----
commentRouter.put("/:commentId", isAuthenticated, checkUserBan, commentRateLimiter, commentsController.update);

//-----Delete comment----
commentRouter.delete("/:commentId", isAuthenticated, commentsController.delete);

//-----Like/Unlike comment----
commentRouter.post("/:commentId/like", isAuthenticated, checkUserBan, commentRateLimiter, commentsController.toggleLike);

//-----Get comment replies----
commentRouter.get("/:commentId/replies", commentsController.getReplies);

module.exports = commentRouter;
