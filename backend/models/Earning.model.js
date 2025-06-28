const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema({
     user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
     post:{
        type:mongoose.Schema.ObjectId,
        ref:"Post"
    },
    amonut:{
        type:Number,
        required:true,
    },
    calculationOn:{
        type:Date,
        default:Date.now,
    },
},{timestamps:true})
module.exports = mongoose.model("Earinig",earningSchema);