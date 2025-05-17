// Initialize Socket.IO
const socket = io();

// DOM Elements
const usernameModal = new bootstrap.Modal(document.getElementById('usernameModal'));
const messagesContainer = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const roomsList = document.getElementById('roomsList');
const onlineUsers = document.getElementById('onlineUsers');
const currentRoomElement = document.getElementById('currentRoom');
const currentUserElement = document.getElementById('currentUser');

// State
let currentUser = '';
let currentRoom = 'general';

// Show username modal on load
document.addEventListener('DOMContentLoaded', () => {
    usernameModal.show();
});

// Join chat
document.getElementById('joinChat').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    if (username) {
        currentUser = username;
        currentUserElement.textContent = username;
        socket.emit('join', { username, room: currentRoom });
        usernameModal.hide();
    }
});

// Send message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('message', { room: currentRoom, message });
        messageInput.value = '';
    }
});

// Switch rooms
roomsList.addEventListener('click', (e) => {
    if (e.target.dataset.room) {
        const newRoom = e.target.dataset.room;
        socket.emit('join', { username: currentUser, room: newRoom });
        currentRoom = newRoom;
        currentRoomElement.textContent = newRoom.charAt(0).toUpperCase() + newRoom.slice(1);
        messagesContainer.innerHTML = '';
        
        // Update active room in UI
        document.querySelectorAll('#roomsList button').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
    }
});

// Private messaging
onlineUsers.addEventListener('click', (e) => {
    if (e.target.dataset.username) {
        const recipient = e.target.dataset.username;
        const message = prompt(`Send private message to ${recipient}:`);
        if (message) {
            socket.emit('privateMessage', { to: recipient, message });
        }
    }
});

// Socket event handlers
socket.on('message', (data) => {
    appendMessage(data, false);
});

socket.on('privateMessage', (data) => {
    appendMessage({
        username: data.from,
        message: `[Private] ${data.message}`,
        timestamp: data.timestamp
    }, true);
});

socket.on('userJoined', (data) => {
    appendSystemMessage(data.message);
});

socket.on('userLeft', (data) => {
    appendSystemMessage(data.message);
});

socket.on('roomMembers', (members) => {
    onlineUsers.innerHTML = members
        .filter(username => username !== currentUser)
        .map(username => `
            <button class="list-group-item list-group-item-action" data-username="${username}">
                <i class="fas fa-user me-2"></i>${username}
            </button>
        `).join('');
});

// Helper functions
function appendMessage(data, isPrivate) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.username === currentUser ? 'sent' : 'received'}`;
    if (isPrivate) messageDiv.classList.add('private');
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${data.username}</strong>: ${data.message}
            <div class="message-time">${formatTime(data.timestamp)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'text-center text-muted my-2';
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}