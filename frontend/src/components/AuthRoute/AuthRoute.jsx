import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AuthCheckingComponent from "./AuthCheckingComponent";

const AuthRoute = ({ children }) => {
  const { userAuth } = useSelector((state) => state.auth);

  console.log("AuthRoute - userAuth:", userAuth);

  // If userAuth is null, it means the auth check is still loading
  // Don't redirect to login until we're sure the user is not authenticated
  if (userAuth === null) {
    console.log("AuthRoute - showing loading component");
    return <AuthCheckingComponent />;
  }
  
  // If userAuth is false/undefined, user is not authenticated
  if (!userAuth) {
    console.log("AuthRoute - redirecting to login");
    return <Navigate to="/login" />;
  }
  
  // If userAuth exists, user is authenticated
  console.log("AuthRoute - rendering children");
  return children;
};

export default AuthRoute;
