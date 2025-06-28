const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
     user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
    },
    reference:{
        type:String,
        required:true,
    },
    currency:{
      type:String,
        required:true,
    },
      status:{
      type:String,
      default:pending,
        required:true,
    },
       subscriptionPlan:{
        type:mongoose.Schema.ObjectId,
        ref:"Plan",
        required:true,
    },   
    amount:{
      type:Number,
       default:0
    },
    monthlyRequestCounnt:{
        type:Number,
    }

},{timestamps:true})
const Payment= mongoose.model("Payment",paymentSchema);
module.exports = Payment;