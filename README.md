# PINGMe - Real-Time Messaging Application

PINGMe is a sleek, modern, and high-performance real-time messaging application designed for seamless communication. It utilizes a robust, event-driven architecture to deliver instant chat interactions with sub-200ms latency, protected by secure authentication and database persistence.

## Features

* **Real-Time Communication**: Built with Socket.IO to enable instant message delivery and real-time event synchronization across connected users.
* **JWT-Based Authentication**: Secure sign-in and token verification workflows, ensuring all API queries and websocket connection handshakes are fully authorized.
* **Instant Read Receipts**: Real-time tick notifications displaying sent and seen statuses (single/double ticks) dynamically as messages are read.
* **User Search & Discovery**: Real-time user discovery allowing users to easily query, locate, and initiate channels with other registered participants.
* **Custom Profile Pictures**: Supports customized user profile picture (DP) uploads managed dynamically and served via static path routing.
* **Unread Message Counters**: Instant updates on unseen message counts for passive chat lists whenever a new message arrives from counterparties.

## Tech Stack

* **Frontend**: React.js, React Router Dom v7, Tailwind CSS v4, Lucide React, Socket.IO Client, Vite
* **Backend**: Node.js, Express.js, Socket.IO, Multer, JWT, BcryptJS
* **Database**: MongoDB (via Mongoose ODM)

<br>
Developed with ❤️ by Aviral