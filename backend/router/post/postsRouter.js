const express = require('express');
// const Post = require('../../models/Post'); // Adjust path if needed
const PostController = require('../../controllers/post/postController');
const postController = require('../../controllers/post/postController');
const multer = require('multer')
const storage = require("../../utils/fileUpload");
const isAuthenticated = require('../../middlewares/isAuthenticated');

//! create multer instance
const upload = multer({storage});

//! create instance express router
const postRouter = express.Router()

//---------Createpost------------
postRouter.post('/publish',isAuthenticated,upload.single('image'),PostController.create);


// -----------Lists all posts---------
postRouter.get('/Posts',postController.fetchallPost );
//-----------------Update Post--------

postRouter.put('/update/:postId', postController.update);
//----------Get post------------

postRouter.get('/get/:postId',postController.get )
//--------------Delete POst----------
postRouter.delete('/delete/:postId',postController.delete )

module.exports = postRouter;
