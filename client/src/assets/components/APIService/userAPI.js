import { BASE_URL } from "../utils/baseEndpoint"
import axios from "axios"
//! Register URl
export const registerAPI = async(userData) =>{
    const response = await axios.post(`${BASE_URL}/users/register`,{
      username:userData.username,
      password:userData.password,
      email:userData.email
    },{
        withCredentials:true,
    }
);
return response.data;
};

//! Login User URl
export const loginAPI = async(userData) =>{
    const response = await axios.post(`${BASE_URL}/users/login`,{
      username:userData.username,
      password:userData.password,
      email:userData.email
    },{
        withCredentials:true,
    }
);
return response.data;
};
//! checkAuthStatusAPI for user
export const checkAuthStatusAPI = async () => {
  const response = await axios.get(`${BASE_URL}/users/checkAuthenticated`, {
    withCredentials: true,
  });

  return response.data;
};
// ! logout user
export const logoutAPI = async(userData) =>{
    const response = await axios.post(`${BASE_URL}/users/logout`,
      {},{
        withCredentials:true,
    }
);
return response.data;
};

