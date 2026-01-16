const express = require('express');
const { readJSON, writeJSON } = require('../utils');
const router = express.Router();

const CHATS_PATH = './backend/data/chats.json';
const USERS_PATH = './backend/data/users.json';

router.get('/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const chats = readJSON(CHATS_PATH);
    const userChats = chats.filter(chat => chat.users.includes(userId));
    res.json(userChats);
});

router.post('/', (req, res) => {
    const { senderId, receiverUsername } = req.body;
    const users = readJSON(USERS_PATH);
    const receiver = users.find(u => u.username === receiverUsername);
    if (!receiver) return res.status(404).json({ message: 'User not found' });

    const chats = readJSON(CHATS_PATH);
    let chat = chats.find(c =>
        c.users.includes(senderId) && c.users.includes(receiver.id)
    );

    if (!chat) {
        chat = { id: Date.now(), users: [senderId, receiver.id] };
        chats.push(chat);
        writeJSON(CHATS_PATH, chats);
    }

    res.json(chat);
});

module.exports = router;
