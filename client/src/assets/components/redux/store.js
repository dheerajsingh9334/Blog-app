import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlices";

// create Store
export const store = configureStore({
    reducer:{
        auth:authReducer,
    },
});