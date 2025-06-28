import React, { useEffect } from 'react'
import CreatePost from './assets/components/Posts/CreatePost'
import PostsList from './assets/components/Posts/PostsList'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicNavbar from './assets/components/Navbar/PublicNavbar'
import Home from './assets/components/HomePage/Home'
import Login from './assets/components/User/Login'
import Register from './assets/components/User/Register.jsx'
import UpdatePost from './assets/components/Posts/UpdatePost'
import PostDetails from './assets/components/Posts/PostDetails'
import Profile from './assets/components/User/Profile.jsx'
import PrivateNavbar from './assets/components/Navbar/PrivateNavbar.jsx'
import { useSelector,useDispatch } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { checkAuthStatusAPI } from './assets/components/APIService/userAPI.js'
import { isAuthenticated } from './assets/components/redux/authSlices.js'
import AuthRoute from './assets/components/AuthRoute/AuthRoute.jsx'

const App = () => {
  //! use Query
    const dispatch = useDispatch();
    const userAuth = useSelector((state) => state.auth.userAuth);
  
    const {
      data,
      isSuccess,
    } = useQuery({
      queryKey: ['user-auth'],
      queryFn: checkAuthStatusAPI,
    });
  
    useEffect(() => {
      if (isSuccess && data) {
        console.log("API Data:", data);
        dispatch(isAuthenticated(data));
      }
    }, [isSuccess, data, dispatch]);
  
  
  // get the login user from store


  return (
    <BrowserRouter>
    {/* //!Navbar */}
 
      {userAuth ? <PrivateNavbar/> : <PublicNavbar />}
      <Routes>
     <Route element={<Home />} path="/" />
        <Route element={<CreatePost />} path="/create-post" />
        <Route element={<PostsList />} path="/posts" />
        <Route element={<PostDetails />} path="/posts/:postId" />
        <Route element={<Login />} path="/login" />
        <Route element={<Register />} path="/register" />
        <Route element={<AuthRoute>
          <Profile />
        </AuthRoute>} path="/profile" />
          {/* <Route element={<UpdatePost />} path="/posts/:postId" /> */}
        {/* <CreatePost />
        <PostsList /> */}

      </Routes>
    </BrowserRouter>
  )
}

export default App