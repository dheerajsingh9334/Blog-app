import axios from "axios";
import { BASE_URL as ROOT_BASE } from "../../utils/baseEndpoint";
//create that must return a promise
const BASE_URL = `${ROOT_BASE}/comments`;

//!Create comment api
export const createCommentAPI = async (data) => {
  const response = await axios.post(`${BASE_URL}/create`, data, {
    withCredentials: true,
  });
  return response.data;
};

//!Update comment api
export const updateCommentAPI = async (commentId, data) => {
  const response = await axios.put(`${BASE_URL}/${commentId}`, data, {
    withCredentials: true,
  });
  return response.data;
};

//!Delete comment api
export const deleteCommentAPI = async (commentId) => {
  const response = await axios.delete(`${BASE_URL}/${commentId}`, {
    withCredentials: true,
  });
  return response.data;
};

//!Like/Unlike comment api
export const toggleCommentLikeAPI = async (commentId) => {
  const response = await axios.post(`${BASE_URL}/${commentId}/like`, {}, {
    withCredentials: true,
  });
  return response.data;
};

//!Get comment replies api
export const getCommentRepliesAPI = async (commentId) => {
  const response = await axios.get(`${BASE_URL}/${commentId}/replies`);
  return response.data;
};
