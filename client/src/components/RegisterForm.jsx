import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiBase } from "../utils";

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [dp, setDp] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch(`${apiBase}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
            if (dp) {
                const formDataObj = new FormData();
                formDataObj.append("dp", dp);
                await fetch(`${apiBase}/upload-dp/${formData.username}`, {
                    method: "POST",
                    body: formDataObj,
                });
            }
            alert("Registration successful");
            navigate("/login");
        } else {
            alert(data.message);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-[#1e293b] p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-700"
        >
            <h2 className="text-3xl font-semibold mb-6 text-center text-white">
                Create an Account
            </h2>

            <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full mb-4 px-4 py-3 rounded-xl bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />

            <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full mb-4 px-4 py-3 rounded-xl bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />

            <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full mb-4 px-4 py-3 rounded-xl bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />

            <label className="block mb-6">
                <span className="text-sm text-gray-300 block mb-2">
                    Optional Profile Picture:
                </span>

                <div className="relative w-full">
                    <label
                        htmlFor="dp-upload"
                        className="inline-block cursor-pointer px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-200 text-center w-full"
                    >
                        {dp ? "Selected: " + dp.name : "Choose Profile Picture"}
                    </label>
                    <input
                        id="dp-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setDp(e.target.files[0])}
                        className="hidden"
                    />
                </div>
            </label>

            <button className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 transition-all duration-300 text-white py-3 rounded-xl font-medium shadow-md">
                Register
            </button>
        </form>
    );
}
