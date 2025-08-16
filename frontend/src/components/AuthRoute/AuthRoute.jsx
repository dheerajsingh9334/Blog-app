import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AuthCheckingComponent from "./AuthCheckingComponent";

const AuthRoute = ({ children }) => {
  const { userAuth } = useSelector((state) => state.auth);



  // If userAuth is null, it means the auth check is still loading
  // Don't redirect to login until we're sure the user is not authenticated
  if (userAuth === null) {

    return <AuthCheckingComponent />;
  }
  
  // If userAuth is false/undefined, user is not authenticated
  if (!userAuth) {

    return <Navigate to="/login" />;
  }
  
  // If userAuth exists, user is authenticated

  return children;
};

export default AuthRoute;
