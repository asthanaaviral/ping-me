import React, { useEffect, useState } from "react";
import { apiBase } from "../utils";
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

function Avatar({ src, alt }) {
    return src ? (
        <img
            src={src}
            alt={alt}
            className="w-11 h-11 rounded-full object-cover mr-2 border border-gray-700"
        />
    ) : (
        <UserCircle className="w-10 h-10 text-gray-500 mr-2" />
    );
}

export default function ChatList({ user, onSelectChat, selectedChat, socket }) {
    const [chats, setChats] = useState([]);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [lastMessages, setLastMessages] = useState({});
    const [partnerInfoMap, setPartnerInfoMap] = useState({});
    const [unseenCountMap, setUnseenCountMap] = useState({}); // New state

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    useEffect(() => {
        if (!user) return;

        const fetchChats = () => {
            fetch(`${apiBase}/chats/${user.username}`, {
                headers: { "Authorization": `Bearer ${user.token}` }
            })
                .then((res) => res.json())
                .then((data) => setChats(data))
                .catch((err) => console.error("Failed to fetch chats:", err));
        };

        fetchChats();

        if (!socket) return;

        const handleChatCreated = (newChat) => {
            setChats((prev) => {
                if (prev.find((c) => c.id === newChat.id)) return prev;
                return [...prev, newChat];
            });
        };

        socket.on("chat_created", handleChatCreated);

        return () => {
            socket.off("chat_created", handleChatCreated);
        };
    }, [user, socket]);

    // Fetch messages for last message snippet AND unseen count
    useEffect(() => {
        if (!user) return;
        chats.forEach((chat) => {
            fetch(`${apiBase}/messages/${chat.id}`, {
                headers: { "Authorization": `Bearer ${user.token}` }
            })
                .then((res) => res.json())
                .then((messages) => {
                    if (messages.length > 0) {
                        const lastMsg = messages[messages.length - 1];
                        const snippet =
                            lastMsg.content.length > 40
                                ? lastMsg.content.slice(0, 40) + "..."
                                : lastMsg.content;
                        setLastMessages((prev) => ({
                            ...prev,
                            [chat.id]: snippet,
                        }));
                    } else {
                        setLastMessages((prev) => ({ ...prev, [chat.id]: "" }));
                    }

                    const unseenCount = messages.filter(
                        (msg) => !msg.seen && msg.sender !== user.username
                    ).length;

                    setUnseenCountMap((prev) => ({
                        ...prev,
                        [chat.id]: unseenCount,
                    }));
                })
                .catch((err) => {
                    console.error(
                        "Failed to fetch messages for chat",
                        chat.id,
                        err
                    );
                    setLastMessages((prev) => ({ ...prev, [chat.id]: "" }));
                    setUnseenCountMap((prev) => ({ ...prev, [chat.id]: 0 }));
                });
        });
    }, [chats, user.username, user.token]);

    // Handle real-time updates via Socket.IO
    useEffect(() => {
        if (!socket) return;

        const handleIncomingMessage = (msg) => {
            const snippet = msg.content.length > 40 ? msg.content.slice(0, 40) + "..." : msg.content;
            setLastMessages((prev) => ({
                ...prev,
                [msg.chatId]: snippet,
            }));

            if (msg.sender !== user.username && selectedChat?.id !== msg.chatId) {
                setUnseenCountMap((prev) => ({
                    ...prev,
                    [msg.chatId]: (prev[msg.chatId] || 0) + 1,
                }));
            }
        };

        const handleMessagesSeen = ({ chatId, username }) => {
            if (username === user.username) {
                setUnseenCountMap((prev) => ({
                    ...prev,
                    [chatId]: 0,
                }));
            }
        };

        socket.on("message", handleIncomingMessage);
        socket.on("messages_seen", handleMessagesSeen);

        return () => {
            socket.off("message", handleIncomingMessage);
            socket.off("messages_seen", handleMessagesSeen);
        };
    }, [socket, user.username, selectedChat]);

    // Fetch partner user info
    useEffect(() => {
        const fetchPartnerInfos = async () => {
            const newInfo = {};
            for (const chat of chats) {
                const partner = chat.users.find((u) => u !== user.username);
                if (!partnerInfoMap[partner]) {
                    try {
                        const res = await fetch(
                            `${apiBase}/get-user/${partner}`,
                            { headers: { "Authorization": `Bearer ${user.token}` } }
                        );
                        const data = await res.json();
                        newInfo[partner] = data;
                    } catch (err) {
                        console.error(
                            `Failed to fetch user info for ${partner}`,
                            err
                        );
                    }
                }
            }
            if (Object.keys(newInfo).length > 0) {
                setPartnerInfoMap((prev) => ({ ...prev, ...newInfo }));
            }
        };
        if (chats.length > 0) fetchPartnerInfos();
    }, [chats, user.username, user.token]);

    // Search users for new chat
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search.trim()) {
                fetch(`${apiBase}/search?username=${search}`, {
                    headers: { "Authorization": `Bearer ${user.token}` }
                })
                    .then((res) => res.json())
                    .then((data) => setResults(data));
            } else {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [search, user.token]);

    const startChat = async (recipient) => {
        const res = await fetch(`${apiBase}/chats`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            },
            body: JSON.stringify({ user1: user.username, user2: recipient }),
        });
        const chat = await res.json();
        setChats((prev) => {
            if (prev.find((c) => c.id === chat.id)) return prev;
            return [...prev, chat];
        });
        onSelectChat(chat);
        setSearch("");
        setResults([]);
    };

    return (
        <div className="w-1/5 bg-gray-800 border-r border-gray-700 overflow-y-auto p-4">
            {/* User Profile Section */}
            <div className="flex items-center justify-between gap-4 mb-6 border-b border-gray-600 pb-4">
                <div className="flex items-center gap-3">
                    <Avatar
                        src={user.dp ? `${apiBase}${user.dp}` : null}
                        alt={user.username}
                    />
                    <div>
                        <div className="text-gray-100 font-semibold">
                            {user.username}
                        </div>
                        <div className="text-sm text-gray-400">Online</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500 transition"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* Search Box */}
            <div className="mb-5">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 text-sm rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Search Results */}
            {results.length > 0 && (
                <div className="mb-4">
                    {results.map((u) => (
                        <div
                            key={u.username}
                            className="cursor-pointer p-2 hover:bg-gray-700 flex items-center rounded-lg"
                            onClick={() => startChat(u.username)}
                        >
                            <Avatar
                                src={u.dp ? `${apiBase}${u.dp}` : null}
                                alt={u.username}
                            />
                            <span className="text-gray-100">{u.username}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Chat List */}
            <h3 className=" font-semibold mb-2 text-gray-200">Your Chats</h3>
            {chats.map((chat) => {
                const partner = chat.users.find((u) => u !== user.username);
                const partnerData = partnerInfoMap[partner] || {};
                const unseenCount = unseenCountMap[chat.id] || 0;

                return (
                    <div
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        className={`p-3 rounded-lg cursor-pointer mb-2 flex items-center justify-between transition-colors duration-200 ${
                            selectedChat?.id === chat.id
                                ? "bg-blue-600"
                                : "hover:bg-gray-700"
                        }`}
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <Avatar
                                src={
                                    partnerData.dp
                                        ? `${apiBase}${partnerData.dp}`
                                        : null
                                }
                                alt={partner}
                            />
                            <div className="flex flex-col min-w-0">
                                <div className="font-semibold text-gray-100 truncate">
                                    {partner}
                                </div>
                                <div className="text-sm text-gray-400 truncate max-w-[200px]">
                                    {lastMessages[chat.id] || "No messages yet"}
                                </div>
                            </div>
                        </div>

                        {unseenCount > 0 && (
                            <div className="bg-red-600 text-white text-xs rounded-full px-3 py-[2px] ml-2 min-w-[22px] text-center shadow-md">
                                {unseenCount}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
