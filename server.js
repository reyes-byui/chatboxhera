const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Chat = require('./models/Chat');
require('dotenv').config(); // Load environment variables

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for testing; restrict this in production
        methods: ['GET', 'POST'],
    },
});

mongoose.set('debug', true); // Enable Mongoose debugging
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.static('public')); // Ensure this serves the 'public' directory

// Add this line to explicitly serve the icons folder if needed
app.use('/icons', express.static('public/icons'));

// Handle incoming messages
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

    socket.on('chat message', (msg) => {
        if (!msg.username || !msg.message) {
            console.error('Invalid message received:', msg); // Log invalid messages
            return;
        }

        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false }); // Format timestamp to HH:MM:SS
        const chatMessage = new Chat({
            username: msg.username,
            message: msg.message,
            timestamp,
        });

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
    console.log(`Server is running on port ${PORT}`);
});
