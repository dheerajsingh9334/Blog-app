import axios from "axios";
import { BASE_URL as ROOT_BASE } from "../../utils/baseEndpoint";
//create that must return a promise
const BASE_URL = `${ROOT_BASE}/stripe`;

//!Create post api
export const paymentIntentAPI = async (planId) => {
  const response = await axios.post(
    `${BASE_URL}/checkout`,
    {
      subscriptionPlanId: planId,
    },
    {
      withCredentials: true,
    }
  );
  return response.data;
};
//!payment verification
export const paymentVerificationAPI = async (paymentId) => {
  const response = await axios.get(`${BASE_URL}/verify/${paymentId}`, {
    withCredentials: true,
  });
  return response.data;
};
//!Free pln
export const freePlanAPI = async () => {
  const response = await axios.get(`${BASE_URL}/free-plan`, {
    withCredentials: true,
  });
  return response.data;
};
