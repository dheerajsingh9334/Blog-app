const Post = require('../../models/Post');


const postController={
    //Create Post
create:async (req, res, next) => {
    try {
        console.log(req.file);
         console.log("Body:", req.body);
        
        //get all payload
     //  const { title, description }
        const {  description } = req.body;
        //find the post by title
        // const postFound = await Post.findOne({ title });
        // if (postFound) {
        //     throw new Error("Post already exists");
        // }

        const postCreated = await Post.create({  description,image:req.file });
        res.json({
            status: "success",
            message: "Post created successfully",
            postCreated,
        });
    } catch (error) {
        next(error); 
    }
},

//----------FetchallPost
fetchallPost:async (req, res) => {
    try {
        const posts = await Post.find();
        res.json({
            status: "success",
            message: "Posts fetched successfully",
            posts,
        });
    } catch (error) {
        console.error("Posts not fetched:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
    console.log(post.image);    
},

//------------updatePost---------
update:async (req, res) => {
    try {
        const postId = req.params.postId;
        console.log("Received ID:", postId);

        const postFound = await Post.findById(postId);
        if (!postFound) {
            return res.status(404).json({ status: "error", message: "Post not found" });
        }

        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ status: "error", message: "Missing title or description" });
        }

        const postUpdated = await Post.findByIdAndUpdate(
            postId,
            { title, description },
            { new: true }
        );

        res.json({
            status: "success",
            message: "Post updated successfully",
            postUpdated
        });
    } catch (error) {
        console.error("update error", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
},

//----------Get post------------
get:async (req, res) =>{
    try{
const postId = req.params.postId;
const postFound = await Post.findById(postId);
res.json({
    status:"post fetched successfully",
    postFound
})
    }
    catch(error){
        throw new Error(error)
    }
},

//--------------Delete POst----------
delete:async (req, res) =>{
    try{
const postId = req.params.postId;
const postFound = await Post.findByIdAndDelete(postId);
res.json({
    status:"post delete successfully",
    postFound
})
    }
    catch(error){
        throw new Error(error)
    }
}
}


 

module.exports = postController;