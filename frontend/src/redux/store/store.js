import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../slices/authSlices";
import adminAuthReducer from "../slices/adminAuthSlice";

// Persist configuration for admin auth
const adminAuthPersistConfig = {
  key: "adminAuth",
  storage,
  whitelist: ["adminAuth", "isAdminAuthenticated"], // Only persist these fields
};

// Persist configuration for user auth
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["userAuth"], // Only persist the userAuth field
};

// Create persisted reducers
const persistedAdminAuthReducer = persistReducer(adminAuthPersistConfig, adminAuthReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Create store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    adminAuth: persistedAdminAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
