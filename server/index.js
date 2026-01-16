const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { readData, writeData } = require("./utils");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.json");
const chatsFile = path.join(dataDir, "chats.json");
const messagesFile = path.join(dataDir, "messages.json");

const uploadDir = path.join(__dirname, "uploads");

const upload = multer({
    dest: uploadDir,
});

app.use("/uploads", express.static(uploadDir));

// Register
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return res.status(400).json({ message: "Missing fields" });

    const users = readData(usersFile);
    if (users.find((u) => u.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }
    users.push({ username, email, password, dp: null }); // Add dp as null initially
    writeData(usersFile, users);
    res.json({ message: "Registration successful" });
});

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = readData(usersFile);
    const user = users.find(
        (u) => u.username === username && u.password === password
    );
    if (!user)
        return res
            .status(401)
            .json({ message: "Invalid username or password" });

    res.json({
        username: user.username,
        email: user.email,
        dp: user.dp || null,
    });
});

// Search users by username (starts with)
app.get("/search", (req, res) => {
    const { username = "" } = req.query;
    const users = readData(usersFile);
    const matches = users.filter((u) =>
        u.username.toLowerCase().startsWith(username.toLowerCase())
    );
    // Return username and dp only (avoid sending password/email unnecessarily)
    const safeMatches = matches.map(({ username, dp }) => ({
        username,
        dp: dp || null,
    }));
    res.json(safeMatches);
});

// Get chats for user
app.get("/chats/:username", (req, res) => {
    const { username } = req.params;
    const chats = readData(chatsFile);
    const userChats = chats.filter((c) => c.users.includes(username));
    res.json(userChats);
});

// Upload profile picture (dp)
app.post("/upload-dp/:username", upload.single("dp"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const username = req.params.username;
        const ext = path.extname(req.file.originalname);
        const newFilename = username + ext;
        const newPath = path.join(uploadDir, newFilename);

        // Rename uploaded file to username + extension
        fs.renameSync(req.file.path, newPath);

        const users = readData(usersFile);
        const user = users.find((u) => u.username === username);
        if (user) {
            user.dp = `/uploads/${newFilename}`;
            writeData(usersFile, users);
            res.json({ success: true, dp: user.dp });
        } else {
            // Remove the uploaded file if user not found
            fs.unlinkSync(newPath);
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during file upload" });
    }
});

// Create or get chat between two users
app.post("/chats", (req, res) => {
    const { user1, user2 } = req.body;
    if (!user1 || !user2)
        return res.status(400).json({ message: "Missing users" });

    let chats = readData(chatsFile);
    let chat = chats.find(
        (c) => c.users.includes(user1) && c.users.includes(user2)
    );

    if (!chat) {
        chat = {
            id: Date.now().toString(),
            users: [user1, user2],
        };
        chats.push(chat);
        writeData(chatsFile, chats);
    }

    res.json(chat);
});

// Get messages for a chat
app.get("/messages/:chatId", (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = readData(messagesFile); // assuming synchronous read

        // Ensure comparison is done between strings
        const chatMessages = messages.filter(
            (m) => m.chatId.toString() === chatId
        );

        res.json(chatMessages);
    } catch (error) {
        console.error("Failed to get messages:", error);
        res.status(500).json({ error: "Failed to load messages" });
    }
});

// Get user info by username (with dp)
app.get("/get-user/:username", (req, res) => {
    const users = readData(usersFile);
    const user = users.find((u) => u.username === req.params.username);
    if (user) {
        // Return only necessary fields except password
        const { password, ...safeUser } = user;
        res.json(safeUser);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

// Post a new message
app.post("/messages", (req, res) => {
    const { chatId, sender, content, timestamp } = req.body;
    if (!chatId || !sender || !content)
        return res.status(400).json({ message: "Missing fields" });

    const messages = readData(messagesFile);
    const message = {
        chatId,
        sender,
        content,
        timestamp: timestamp || Date.now(),
        sent: true, // message successfully stored => sent
        seen: false, // initially not seen
        id: Date.now().toString() + Math.random().toString(36).slice(2), // unique id for message
    };
    messages.push(message);
    writeData(messagesFile, messages);

    res.json(message);
});

app.post("/messages/seen", (req, res) => {
    const { chatId, username } = req.body;
    if (!chatId || !username) {
        return res.status(400).json({ message: "Missing chatId or username" });
    }

    const messages = readData(messagesFile);
    let updated = false;

    messages.forEach((msg) => {
        // Only mark messages as seen if:
        // - message belongs to chatId
        // - message sender is NOT the username (receiver should not mark their own sent messages as seen)
        // - message is currently not seen
        if (msg.chatId === chatId && msg.sender !== username && !msg.seen) {
            msg.seen = true;
            updated = true;
        }
    });

    if (updated) {
        writeData(messagesFile, messages);
    }

    res.json({ success: true, updated });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
