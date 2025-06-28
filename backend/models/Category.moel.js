const mongoose = require('mongoose');

//Schema

const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
      description:{
        type:String,
    },
    posts:[{
        type:mongoose.Schema.ObjectId,ref:"Post"
    }],
    author:{
        type:mongoose.Schema.ObjectId,ref:"User"
    },
},{timestamps:true,})

// model
const Category = mongoose.model("Category",categorySchema);
module.exports = Category;