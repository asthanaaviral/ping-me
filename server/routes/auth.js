const express = require('express');
const { readJSON, writeJSON } = require('../utils');
const router = express.Router();
const USERS_PATH = './backend/data/users.json';

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const users = readJSON(USERS_PATH);
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    const newUser = { id: Date.now(), username, email, password };
    users.push(newUser);
    writeJSON(USERS_PATH, users);
    res.json(newUser);
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSON(USERS_PATH);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    res.json(user);
});

module.exports = router;
