// src/components/Auth/Register.jsx
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link,useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerAPI } from "../APIService/userAPI";
import AlertMessage from "../Alert/AlertMessage";

const Register = () => {
  const navigate = useNavigate();

  const userMutation = useMutation({
    mutationKey: ["user-registration"],
    mutationFn: registerAPI,
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      email: Yup.string()
        .email("Enter valid email")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: (values) => {
                console.log(values);
      userMutation
        .mutateAsync(values)
        .then(() => {
          navigate("/");

        })
        .catch((err) => console.log(err));
    },
  });
console.log(userMutation);

  return (
    <>
    <div className="flex flex-wrap pb-24">
      <div className="w-full p-4">
        <div className="flex flex-col justify-center py-24 max-w-md mx-auto h-full">
          <form onSubmit={formik.handleSubmit}>
            <Link
              to="/login"
              className="inline-block text-gray-500 hover:underline transition duration-200 mb-8"
            >
              Already have an account? <span className="font-bold">Login</span>
            </Link>

            {/* Alerts */}
            {userMutation.isPending && (
              <AlertMessage type="loading" message="Loading please wait..." />
            )}
            {userMutation.isSuccess && (
              <AlertMessage type="success" message="Login success" />
            )}
            {userMutation.isError && (
              <AlertMessage
                type="error"
                message={
                  userMutation.error?.response?.data?.message ||
                  "Registration failed"
                }
              />
            )}

            {/* Username */}
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              className="w-full rounded-full p-4 outline-none border border-gray-100 shadow placeholder-gray-500 focus:ring focus:ring-orange-200 transition duration-200 mb-2"
              type="text"
              placeholder="Enter username"
              {...formik.getFieldProps("username")}
            />
            {formik.touched.username && formik.errors.username && (
              <div className="text-red-500 mb-2">{formik.errors.username}</div>
            )}

            {/* Email */}
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              className="w-full rounded-full p-4 outline-none border border-gray-100 shadow placeholder-gray-500 focus:ring focus:ring-orange-200 transition duration-200 mb-2"
              type="email"
              placeholder="john@email.com"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 mb-2">{formik.errors.email}</div>
            )}

            {/* Password */}
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              className="w-full rounded-full p-4 outline-none border border-gray-100 shadow placeholder-gray-500 focus:ring focus:ring-orange-200 transition duration-200 mb-2"
              type="password"
              placeholder="Enter password"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 mb-2">{formik.errors.password}</div>
            )}

            {/* Submit */}
            <button
              className="h-14 inline-flex items-center justify-center py-4 px-6 text-white font-bold rounded-full bg-orange-500 w-full text-center border border-orange-600 shadow hover:bg-orange-600 focus:ring focus:ring-orange-200 transition duration-200 mb-4"
              type="submit"
            >
              Sign Up
            </button>

            {/* Google Login */}
            <a
          href="http://localhost:5000/api/blogs/users/auth/google"
              className="h-14 inline-flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-white w-full text-center border border-gray-100 shadow hover:bg-gray-50 focus:ring focus:ring-orange-200 transition duration-200"
              type="submit"
            >
           
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path
                  fill="#EA4335"
                  d="M10 8.4v3.2h4.5c-.2 1.2-1 2.1-2.1 2.6v2.2h3.3c1.9-1.7 3-4.2 3-7 0-.6-.1-1.3-.2-1.9H10z"
                />
                <path
                  fill="#34A853"
                  d="M10 20c2.7 0 4.9-.9 6.5-2.4l-3.3-2.2c-.9.6-2.1.9-3.2.9-2.5 0-4.6-1.7-5.4-4H1.2v2.5C2.7 18.5 6.1 20 10 20z"
                />
                <path
                  fill="#FBBC05"
                  d="M4.6 12c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V5.5H1.2C.5 6.9 0 8.4 0 10s.5 3.1 1.2 4.5l3.4-2.5z"
                />
                <path
                  fill="#4285F4"
                  d="M10 4.2c1.5 0 2.9.5 4 1.5l3-3C15 1.2 12.7 0 10 0 6.1 0 2.7 1.5 1.2 5.5L4.6 8c.8-2.3 2.9-3.8 5.4-3.8z"
                />
              </svg>
              Sign up with Google
            </a>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default Register;
