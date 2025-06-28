const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
     author:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
     post:{
        type:mongoose.Schema.ObjectId,
        ref:"Post",
        required:true,
    },
},{timestamps:true})
module.exports = mongoose.model("Comment",commentSchema);