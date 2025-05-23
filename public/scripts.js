const socket = io();
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const usernameInput = document.getElementById('username');
const mediaInput = document.getElementById('media');
let currentDate = '';

// Store username-to-color mapping
const usernameColors = {};

// Helper function to generate a random color
function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

// Helper function to get or assign a color to a username
function getUsernameColor(username) {
    if (!usernameColors[username]) {
        usernameColors[username] = getRandomColor();
    }
    return usernameColors[username];
}

// Helper function to convert URLs in text to clickable links
function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Match URLs starting with http or https
    return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

// Display chat history
socket.on('chat history', (data) => {
    if (!data || !data.date || !data.messages) {
        console.error('Invalid chat history data received:', data); // Log invalid data
        return;
    }

    currentDate = data.date;
    const dateItem = document.createElement('div');
    dateItem.textContent = `Date: ${currentDate}`;
    dateItem.classList.add('date'); // Add a class for styling
    messages.appendChild(dateItem);

    data.messages.forEach((msg) => {
        if (!msg.timestamp || !msg.username || !msg.message) {
            console.error('Invalid message in chat history:', msg); // Log invalid messages
            return;
        }

        const usernameColor = getUsernameColor(msg.username); // Get color for username
        const item = document.createElement('div');
        item.classList.add('message'); // Add a class for styling
        item.innerHTML = `<span style="color: ${usernameColor}">[${msg.timestamp}] ${msg.username}:</span> ${linkify(msg.message)}`;
        messages.appendChild(item);
    });
});

// Send message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const message = input.value.trim();

    if (!username) {
        alert('Please enter a username before sending a message.');
        return;
    }

    socket.emit('chat message', { username, message });
    input.value = ''; // Clear the input field
});

// Display new messages
socket.on('chat message', (msg) => {
    if (!msg.timestamp || !msg.username || !msg.message) {
        console.error('Invalid new message received:', msg);
        return;
    }

    const usernameColor = getUsernameColor(msg.username); // Get color for username
    const item = document.createElement('div');
    item.classList.add('message'); // Add a class for styling
    item.innerHTML = `<span style="color: ${usernameColor}">[${msg.timestamp}] ${msg.username}:</span> ${msg.message}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

// Handle connection errors
socket.on('connect_error', (err) => {
    console.error('Connection error:', err); // Log connection errors
});

// Handle disconnection
socket.on('disconnect', () => {
    console.warn('Disconnected from server'); // Log disconnection
});

const darkIcon = document.getElementById('dark-icon');
const lightIcon = document.getElementById('light-icon');

// Toggle between dark and light themes
darkIcon.addEventListener('click', () => {
    document.body.classList.remove('light-mode'); // Remove light mode class
    darkIcon.style.display = 'none'; // Hide dark icon
    lightIcon.style.display = 'inline'; // Show light icon
});

lightIcon.addEventListener('click', () => {
    document.body.classList.add('light-mode'); // Add light mode class
    lightIcon.style.display = 'none'; // Hide light icon
    darkIcon.style.display = 'inline'; // Show dark icon
});
