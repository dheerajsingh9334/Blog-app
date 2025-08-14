import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminAuth: null,
  isAdminAuthenticated: false,
  adminLoading: false,
  adminError: null,
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    adminLoginStart: (state) => {
      state.adminLoading = true;
      state.adminError = null;
    },
    adminLoginSuccess: (state, action) => {
      state.adminAuth = action.payload;
      state.isAdminAuthenticated = true;
      state.adminLoading = false;
      state.adminError = null;
    },
    adminLoginFailure: (state, action) => {
      state.adminAuth = null;
      state.isAdminAuthenticated = false;
      state.adminLoading = false;
      state.adminError = action.payload;
    },
    adminLogout: (state) => {
      state.adminAuth = null;
      state.isAdminAuthenticated = false;
      state.adminLoading = false;
      state.adminError = null;
    },
    adminAuthStatus: (state, action) => {
      if (action.payload) {
        state.adminAuth = action.payload;
        state.isAdminAuthenticated = true;
      } else {
        state.adminAuth = null;
        state.isAdminAuthenticated = false;
      }
      state.adminLoading = false;
    },
    clearAdminError: (state) => {
      state.adminError = null;
    },
  },
});

export const {
  adminLoginStart,
  adminLoginSuccess,
  adminLoginFailure,
  adminLogout,
  adminAuthStatus,
  clearAdminError,
} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;



