import React, { useEffect, useRef, useState } from "react";

export default function MessageInput({ onSend }) {
    const [text, setText] = useState("");
    const inputRef = useRef();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-700 bg-gray-800 flex gap-2"
        >
            <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
            />
            <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200"
            >
                Send
            </button>
        </form>
    );
}
