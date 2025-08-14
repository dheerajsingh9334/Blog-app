const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    planName: { type: String, required: true },
    description: { type: String, default: "" },
    features: [String],
    price: { type: Number, required: true },
    postLimit: { type: Number, default: null }, // null means unlimited
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
