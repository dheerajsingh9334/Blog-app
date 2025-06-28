const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: true,
    },
    feature: [String],
    limitations: [String],
    price: {
        type: Number,
        required: true,
    }
}, { timestamps: true, }
);
const Plan = mongoose.model("Plan",planSchema);
module.exports = Plan;