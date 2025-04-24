const socket = io(); // Ensure this connects to the backend WebSocket server
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const usernameInput = document.getElementById('username');
let currentDate = '';

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

        const item = document.createElement('div');
        item.textContent = `[${msg.timestamp}] ${msg.username}: ${msg.message}`;
        messages.appendChild(item);
    });
});

// Display new messages
socket.on('chat message', (msg) => {
    if (!msg.timestamp || !msg.username || !msg.message) {
        console.error('Invalid new message received:', msg); // Log invalid messages
        return;
    }

    const newDate = new Date().toLocaleDateString();
    if (newDate !== currentDate) {
        currentDate = newDate;
        const dateItem = document.createElement('div');
        dateItem.textContent = `Date: ${currentDate}`;
        dateItem.classList.add('date'); // Add a class for styling
        messages.appendChild(dateItem);
    }

    const item = document.createElement('div');
    item.textContent = `[${msg.timestamp}] ${msg.username}: ${msg.message}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

// Send message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Please enter a username before sending a message.');
        return;
    }
    if (input.value) {
        socket.emit('chat message', { username, message: input.value });
        input.value = '';
    }
});

// Handle connection errors
socket.on('connect_error', (err) => {
    console.error('Connection error:', err); // Log connection errors
});

// Handle disconnection
socket.on('disconnect', () => {
    console.warn('Disconnected from server'); // Log disconnection
});
