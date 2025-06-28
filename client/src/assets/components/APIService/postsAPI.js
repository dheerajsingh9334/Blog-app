import axios from "axios";
//create that must return a prommise

const POST_URL = "http://localhost:5000/api/blogs/Publish";
//!Create publish api
export const createPostAPI = async (postData)=>{
      console.log("sending",postData);
  const response = await axios.post(POST_URL,
    // title:postData.title,
    postData
  );
  return response.data;

};

const FetchPostURL = 'http://localhost:5000/api/blogs/Posts';
//!Fetch all posts
export const fetchAllPosts = async () =>{
 const posts =  await axios.get(FetchPostURL)
 return posts.data
}
//!Fetch  posts
export const fetchPost = async (postId) =>{
 const posts =  await axios.get(`http://localhost:5000/api/blogs/get/${postId}`)
 return posts.data
}
//!delete  posts
export const deletePostAPI = async (postId) =>{
 const posts =  await axios.delete(`http://localhost:5000/api/blogs/delete/${postId}`)
 return posts.data
}
//!Update post api
export const UpdatePostAPI = async (postData)=>{
      console.log("sending",postData);
  const response = await axios.put(`http://localhost:5000/api/blogs/update/${postData.postId}`,{
    title:postData.title,
    description:postData.description,
  });
  return response.data;

};