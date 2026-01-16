import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiBase } from "../utils";

export default function LoginForm() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${apiBase}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("user", JSON.stringify(data));
            navigate("/chat");
        } else {
            alert(data.message);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-gray-800 text-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700"
        >
            <h2 className="text-3xl font-bold mb-6 text-center text-white">
                Welcome Back
            </h2>
            <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Username</label>
                <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-200"
            >
                Login
            </button>
        </form>
    );
}
