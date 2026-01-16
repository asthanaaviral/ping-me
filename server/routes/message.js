const express = require('express');
const { readJSON, writeJSON } = require('../utils');
const router = express.Router();

const MESSAGES_PATH = './backend/data/messages.json';

router.get('/:chatId', (req, res) => {
    const chatId = parseInt(req.params.chatId);
    const messages = readJSON(MESSAGES_PATH);
    const chatMessages = messages.filter(m => m.chatId === chatId);
    res.json(chatMessages);
});

router.post('/', (req, res) => {
    const { chatId, senderId, content } = req.body;
    const messages = readJSON(MESSAGES_PATH);
    const newMessage = {
        id: Date.now(),
        chatId,
        senderId,
        content,
        timestamp: new Date().toISOString()
    };
    messages.push(newMessage);
    writeJSON(MESSAGES_PATH, messages);
    res.json(newMessage);
});

module.exports = router;
