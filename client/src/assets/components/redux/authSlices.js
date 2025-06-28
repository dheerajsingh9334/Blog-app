
import { createSlice } from '@reduxjs/toolkit';
const authSlice = createSlice({
    name:'auth',
    initialState:{
        userAuth:null
    },
    reducers:{
        isAuthenticated:(state,action) =>{
            state.userAuth = action.payload;
        },
        //logout
        logout:(state) =>{
               state.userAuth = null
        },
    },
});

// get the actions
export const {isAuthenticated,logout} = authSlice.actions
// get the reducere
const authReducer = authSlice.reducer;
export default authReducer;