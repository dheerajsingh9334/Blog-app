import React from 'react';
import { FaSpinner } from "react-icons/fa";
import { checkAuthStatusAPI } from '../APIService/userAPI';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
    const {
        data,
        isError,
        isLoading
    } = useQuery({
        queryKey: ['user-auth'],
        queryFn: checkAuthStatusAPI,
        retry: false // Prevent multiple retries if auth check fails
    });

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-white">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
                <p className="mt-4 text-lg text-gray-900">
                    Checking authentication status, please wait...
                </p>
            </div>
        );
    }

    // Error or not authenticated
    if (isError || !data) {
        return <Navigate to="/login" replace />; // Note lowercase 'login'
    }

    // Render protected content
    return children;
};

export default AuthRoute;