import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { isAuthenticated } from '../redux/authSlices';
import { checkAuthStatusAPI } from '../APIService/userAPI';

const Profile = () => {
  const dispatch = useDispatch();
  const userAuth = useSelector((state) => state.auth.userAuth);

  const {
    data,
    isSuccess,
    isLoading,
    isError,
    error,
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


  return (
    <div>
      <h2>Profile</h2>
      {userAuth ? (
        <pre>{JSON.stringify(userAuth, null, 2)}</pre>
      ) : (
        <p>No user data in Redux</p>
      )}
    </div>
  );
};

export default Profile;
