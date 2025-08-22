import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginAPI } from "../../APIServices/users/usersAPI";
import AlertMessage from "../Alert/AlertMessage";
import { BASE_URL } from "../../utils/baseEndpoint";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { isAuthenticated } from "../../redux/slices/authSlices";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const userMutation = useMutation({
    mutationKey: ["user-login"],
    mutationFn: loginAPI,
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
    }),
    onSubmit: (values) => {
      userMutation
        .mutateAsync(values)
        .then((data) => {
          // Update Redux state with user data
          dispatch(isAuthenticated(data));
          // Invalidate and refetch auth query
          queryClient.invalidateQueries(['user-auth']);
          // Navigate to dashboard
          navigate("/postlist");
        })
        .catch(() => {});
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign in to continue</p>
        </div>

        {userMutation.isPending && <AlertMessage type="loading" message="Signing you in..." />}
        {userMutation.isSuccess && <AlertMessage type="success" message="Login successful" />}
        {userMutation.isError && (
          <AlertMessage type="error" message={userMutation?.error?.response?.data?.message || "Login failed"} />
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Username</label>
            <input
              type="text"
              {...formik.getFieldProps("username")}
              className="w-full rounded-lg p-3 outline-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
            {formik.touched.username && formik.errors.username && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.username}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...formik.getFieldProps("password")}
                className="w-full rounded-lg p-3 pr-10 outline-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={userMutation.isPending}
            className="w-full h-12 inline-flex items-center justify-center text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            {userMutation.isPending ? "Signing in..." : "Login"}
          </button>
{/* 
          <a
            href={`${BASE_URL}/users/auth/google`}
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FaGoogle /> Sign in with Google
          </a> */}

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
            <Link to="/register" className="text-gray-600 dark:text-gray-300 hover:underline">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
