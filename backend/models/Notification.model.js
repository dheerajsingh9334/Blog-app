const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: mongoose.Schema.ObjectId,
        ref: "Post",
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })
module.exports = mongoose.model("Notification", notificationSchema);