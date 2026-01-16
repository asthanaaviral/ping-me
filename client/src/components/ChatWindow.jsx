import { useEffect, useRef, useState } from "react";
import { apiBase } from "../utils";
import MessageInput from "./MessageInput";

export default function ChatWindow({ user, chat }) {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [partnerUser, setPartnerUser] = useState(null);

    // Fetch messages
    const fetchMessages = () => {
        if (!chat) return;
        fetch(`${apiBase}/messages/${chat.id}`)
            .then((res) => res.json())
            .then((data) => setMessages(data))
            .catch((err) => console.error("Failed to fetch messages:", err));
    };

    // Mark messages as seen
    const markMessagesSeen = () => {
        if (!chat) return;
        fetch(`${apiBase}/messages/seen`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId: chat.id, username: user.username }),
        }).catch((err) =>
            console.error("Failed to mark messages as seen:", err)
        );
    };

    useEffect(() => {
        if (!chat) return;

        fetchMessages();
        markMessagesSeen();

        const interval = setInterval(() => {
            fetchMessages();
            markMessagesSeen();
        }, 3000);

        return () => clearInterval(interval);
    }, [chat]);

    // Fetch partner user info
    useEffect(() => {
        if (!chat) return;

        const partnerUsername = chat.users.find((u) => u !== user.username);
        fetch(`${apiBase}/get-user/${partnerUsername}`)
            .then((res) => {
                if (!res.ok) throw new Error("User not found");
                return res.json();
            })
            .then((data) => setPartnerUser(data))
            .catch((err) => console.error("Failed to fetch user:", err));
    }, [chat, user.username]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (text) => {
        if (!chat) return;
        const message = {
            chatId: chat.id,
            sender: user.username,
            content: text,
            timestamp: Date.now(),
        };
        try {
            const res = await fetch(`${apiBase}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(message),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, data]);
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    if (!chat) {
        return (
            <div className="w-4/5 flex items-center justify-center text-gray-400 text-lg bg-gray-900">
                Select a chat to start messaging
            </div>
        );
    }

    // Tick icons as SVG (can customize)
    const SingleTickIcon = ({ className }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
            />
        </svg>
    );

    return (
        <div className="w-4/5 flex flex-col bg-gray-900">
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center gap-4 font-semibold text-gray-100">
                {partnerUser?.dp ? (
                    <img
                        src={
                            partnerUser.dp.startsWith("http")
                                ? partnerUser.dp
                                : `${apiBase}${partnerUser.dp}`
                        }
                        alt="DP"
                        className="w-10 h-10 rounded-full object-cover border border-gray-600"
                    />
                ) : (
                    <DefaultAvatarIcon />
                )}
                <span>{partnerUser?.username || "Loading..."}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`relative w-fit px-5 py-3 rounded-2xl shadow-md break-words max-w-[75%] ${
                            msg.sender === user.username
                                ? "ml-auto bg-blue-600 text-white"
                                : "mr-auto bg-gray-700 text-gray-200"
                        }`}
                    >
                        <div className="pr-8">
                            {" "}
                            {/* Added right padding to content */}
                            <span>{msg.content}</span>
                        </div>

                        {/* Ticks positioned at bottom-right */}
                        {msg.sender === user.username && (
                            <div className="absolute bottom-1 right-2 flex items-center gap-[1px]">
                                {msg.seen ? (
                                    <>
                                        <SingleTickIcon className="w-3 h-3 text-white" />
                                        <SingleTickIcon className="w-3 h-3 text-blue-400 -ml-1" />
                                    </>
                                ) : msg.sent ? (
                                    <SingleTickIcon className="w-3 h-3 text-white" />
                                ) : null}
                            </div>
                        )}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>
            <MessageInput onSend={sendMessage} />
        </div>
    );
}

// Default avatar icon (updated for dark bg)
function DefaultAvatarIcon() {
    return (
        <img
            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
            alt="Default Avatar"
            className="w-10 h-10 rounded-full object-cover bg-gray-700 border border-gray-600"
            loading="lazy"
        />
    );
}
