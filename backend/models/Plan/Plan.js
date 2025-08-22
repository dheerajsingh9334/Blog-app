const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    planName: { type: String, required: true },
    description: { type: String, default: "" },
    features: [String],
    price: { type: Number, required: true },
    postLimit: { type: Number, default: null }, // null means unlimited
    characterLimit: { type: Number, default: 1000 }, // Default to free tier limit (changed from wordLimit)
    categoryLimit: { type: Number, default: 1 }, // null means unlimited, 1 for free
    canView: { type: Boolean, default: true }, // All plans can view
    canComment: { type: Boolean, default: false }, // Premium and Pro only
    canLike: { type: Boolean, default: false }, // Premium and Pro only
    readersAnalytics: { type: Boolean, default: false },
    imageCustomization: { type: Boolean, default: false }, // New field for image customization
    scheduledPosts: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    tier: { type: String, enum: ["free", "premium", "pro"], default: "free" },
    isActive: { type: Boolean, default: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Made optional for admin-created plans
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Plan", planSchema);
