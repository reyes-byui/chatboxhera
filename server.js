require('dotenv').config(); // Load environment variables

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Chat = require('./models/Chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send chat history to the newly connected user
    Chat.find()
        .then((messages) => {
            const currentDate = new Date().toLocaleDateString(); // Get the current date
            socket.emit('chat history', { date: currentDate, messages }); // Send date with messages
        })
        .catch((err) => {
            console.error('Error fetching chat history:', err); // Log errors
        });

    // Handle incoming messages
    socket.on('chat message', (msg) => {
        if (!msg.username || !msg.message) {
            console.error('Invalid message received:', msg); // Log invalid messages
            return;
        }

        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false }); // Format timestamp to HH:MM:SS
        const chatMessage = new Chat({ username: msg.username, message: msg.message, timestamp });

        chatMessage
            .save()
            .then(() => {
                io.emit('chat message', { ...msg, timestamp }); // Include formatted timestamp in broadcast
            })
            .catch((err) => {
                console.error('Error saving chat message:', err); // Log errors
            });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
