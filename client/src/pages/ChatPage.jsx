import React, { useState, useEffect } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { apiBase } from "../utils";

export default function ChatPage() {
    const [user, setUser] = useState(() =>
        JSON.parse(localStorage.getItem("user"))
    );
    const [selectedChat, setSelectedChat] = useState(null);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const newSocket = io(apiBase, {
            auth: { token: user.token }
        });

        setSocket(newSocket);

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user, navigate]);

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <ChatList
                user={user}
                onSelectChat={setSelectedChat}
                selectedChat={selectedChat}
                socket={socket}
            />
            <ChatWindow user={user} chat={selectedChat} socket={socket} />
        </div>
    );
}
