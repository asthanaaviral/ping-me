import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Lock, MessageCircleMore, Users2 } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0e0c1f] via-[#1a1236] to-[#12101f] text-white flex items-center justify-center px-6 py-10">
            <div className="max-w-4xl w-full text-center space-y-12">
                {/* Header Section */}
                <div className="flex flex-col items-center gap-4">
                    <Sparkles className="w-12 h-12 text-purple-400 animate-pulse drop-shadow" />
                    <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 drop-shadow-lg">
                        Welcome to PINGMe
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
                        A sleek, secure, and modern real-time chat app — built for seamless conversations, beautiful design, and total privacy.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex justify-center gap-6">
                    <Link
                        to="/register"
                        className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-7 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 font-semibold tracking-wide"
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/login"
                        className="bg-[#1e1b3b] hover:bg-[#2b2650] text-purple-300 px-7 py-3 rounded-2xl border border-purple-500 hover:border-purple-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 font-semibold tracking-wide"
                    >
                        Login
                    </Link>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
                    <div className="bg-[#1b1834] p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300">
                        <MessageCircleMore className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-purple-200">Real-Time Chat</h3>
                        <p className="text-gray-400 text-sm mt-2">
                            Send and receive messages instantly with a blazing fast backend.
                        </p>
                    </div>
                    <div className="bg-[#1b1834] p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300">
                        <Lock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-purple-200">Private & Secure</h3>
                        <p className="text-gray-400 text-sm mt-2">
                            Your data stays with you. No tracking, no spying — just chats.
                        </p>
                    </div>
                    <div className="bg-[#1b1834] p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300">
                        <Users2 className="w-8 h-8 text-green-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-purple-200">Connect Freely</h3>
                        <p className="text-gray-400 text-sm mt-2">
                            Chat with anyone, anytime. Find users easily and connect instantly.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-sm text-gray-500 mt-12">
                    Made with ❤️ by Aviral.
                </p>
            </div>
        </div>
    );
}
