const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Models
const User = require("./models/User");
const Chat = require("./models/Chat");
const Message = require("./models/Message");

// Middleware
const authMiddleware = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pingme";
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_pingme_key_2026";

// DB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
    dest: uploadDir,
});

app.use("/uploads", express.static(uploadDir));

// HTTP & Socket Server Setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket Auth Verification
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error: No token provided"));

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error("Authentication error: Invalid token"));
        socket.user = decoded;
        next();
    });
});

// Socket connection logic
io.on("connection", (socket) => {
    const username = socket.user.username;
    console.log(`User connected to websocket: ${username}`);
    socket.join(username);

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${username}`);
    });
});

// Register
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.status(400).json({ message: "Missing fields" });

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.json({ message: "Registration successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            username: user.username,
            email: user.email,
            dp: user.dp || null,
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during login" });
    }
});

// Search users by username (starts with) - protected
app.get("/search", authMiddleware, async (req, res) => {
    try {
        const { username = "" } = req.query;
        const matches = await User.find({
            username: { $regex: "^" + username, $options: "i" }
        });
        const safeMatches = matches.map(({ username, dp }) => ({
            username,
            dp: dp || null,
        }));
        res.json(safeMatches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during user search" });
    }
});

// Get chats for user - protected
app.get("/chats/:username", authMiddleware, async (req, res) => {
    try {
        const { username } = req.params;
        if (username !== req.user.username) {
            return res.status(403).json({ message: "Unauthorized access to chats" });
        }
        const userChats = await Chat.find({ users: username });
        res.json(userChats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching chats" });
    }
});

// Upload profile picture (dp) - unprotected (runs post-register, pre-login)
app.post("/upload-dp/:username", upload.single("dp"), async (req, res) => {
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

        const user = await User.findOne({ username });
        if (user) {
            user.dp = `/uploads/${newFilename}`;
            await user.save();
            res.json({ success: true, dp: user.dp });
        } else {
            // Remove the uploaded file if user not found
            if (fs.existsSync(newPath)) {
                fs.unlinkSync(newPath);
            }
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during file upload" });
    }
});

// Create or get chat between two users - protected
app.post("/chats", authMiddleware, async (req, res) => {
    try {
        const { user1, user2 } = req.body;
        if (!user1 || !user2)
            return res.status(400).json({ message: "Missing users" });

        let chat = await Chat.findOne({
            users: { $all: [user1, user2] }
        });
        if (chat && user1 !== user2 && chat.users.length !== 2) {
            chat = null;
        }

        if (!chat) {
            chat = new Chat({
                users: [user1, user2],
            });
            await chat.save();
            
            // Emit chat creation to participants
            const chatJSON = chat.toJSON();
            io.to(user1).to(user2).emit("chat_created", chatJSON);
        }

        res.json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error creating chat" });
    }
});

// Get messages for a chat - protected
app.get("/messages/:chatId", authMiddleware, async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error("Failed to get messages:", error);
        res.status(500).json({ error: "Failed to load messages" });
    }
});

// Get user info by username (with dp) - protected
app.get("/get-user/:username", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching user" });
    }
});

// Post a new message - protected
app.post("/messages", authMiddleware, async (req, res) => {
    try {
        const { chatId, sender, content, timestamp } = req.body;
        if (!chatId || !sender || !content)
            return res.status(400).json({ message: "Missing fields" });

        const message = new Message({
            chatId,
            sender,
            content,
            timestamp: timestamp || Date.now(),
            sent: true,
            seen: false
        });
        await message.save();

        const chat = await Chat.findById(chatId);
        if (chat) {
            const msgJSON = message.toJSON();
            chat.users.forEach((usr) => {
                io.to(usr).emit("message", msgJSON);
            });
        }

        res.json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error sending message" });
    }
});

// Mark messages as seen - protected
app.post("/messages/seen", authMiddleware, async (req, res) => {
    try {
        const { chatId, username } = req.body;
        if (!chatId || !username) {
            return res.status(400).json({ message: "Missing chatId or username" });
        }

        const result = await Message.updateMany(
            { chatId, sender: { $ne: username }, seen: false },
            { $set: { seen: true } }
        );

        const updated = result.modifiedCount > 0;

        if (updated) {
            const chat = await Chat.findById(chatId);
            if (chat) {
                chat.users.forEach((usr) => {
                    io.to(usr).emit("messages_seen", { chatId, username });
                });
            }
        }

        res.json({ success: true, updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error marking messages as seen" });
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
