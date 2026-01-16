import React from "react";
import RegisterForm from "../components/RegisterForm";
import { Link } from "react-router-dom";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4">
            <RegisterForm />
            <div className="mt-6 text-sm text-gray-400 text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:underline">
                    Login here
                </Link>
                <br />
                <Link to="/" className="text-gray-300 hover:underline mt-2 inline-block">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
