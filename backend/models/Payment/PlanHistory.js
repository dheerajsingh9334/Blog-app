const mongoose = require("mongoose");

const planHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fromPlan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    toPlan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    action: { type: String, enum: ["start", "upgrade", "downgrade", "switch", "cancel"], required: true },
    oldPrice: { type: Number, default: 0 },
    newPrice: { type: Number, default: 0 },
    cycleStart: { type: Date },
    cycleEnd: { type: Date },
    remainingDays: { type: Number, default: 0 },
    creditCalculated: { type: Number, default: 0 }, // value-based credit
    discountApplied: { type: Number, default: 0 }, // applied as discount during upgrade
    refundProcessed: { type: Number, default: 0 }, // refunded during downgrade
    stripeRefundId: { type: String },
    previousPaymentReference: { type: String }, // last payment intent id
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlanHistory", planHistorySchema);
