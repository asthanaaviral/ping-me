import React, { useState, useEffect } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
    const [user, setUser] = useState(() =>
        JSON.parse(localStorage.getItem("user"))
    );
    const [selectedChat, setSelectedChat] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user]);

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <ChatList
                user={user}
                onSelectChat={setSelectedChat}
                selectedChat={selectedChat}
            />
            <ChatWindow user={user} chat={selectedChat} />
        </div>
    );
}
