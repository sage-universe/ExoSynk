const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve static files
app.use(express.static(path.join(__dirname, 'chat')));
app.use(express.static(path.join(__dirname)));

// Store connected users and their rooms
const users = new Map();
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ username, room }) => {
    users.set(socket.id, { username, room });
    socket.join(room);
    
    // Notify room members
    io.to(room).emit('userJoined', {
      username,
      message: `${username} joined the chat`
    });

    // Update room members list
    const roomMembers = Array.from(io.sockets.adapter.rooms.get(room) || [])
      .map(id => users.get(id)?.username)
      .filter(Boolean);
    
    io.to(room).emit('roomMembers', roomMembers);
  });

  socket.on('message', ({ room, message }) => {
    const user = users.get(socket.id);
    if (user) {
      io.to(room).emit('message', {
        username: user.username,
        message,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('privateMessage', ({ to, message }) => {
    const sender = users.get(socket.id);
    if (sender) {
      const recipientSocket = Array.from(users.entries())
        .find(([_, user]) => user.username === to)?.[0];
      
      if (recipientSocket) {
        io.to(recipientSocket).emit('privateMessage', {
          from: sender.username,
          message,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      io.to(user.room).emit('userLeft', {
        username: user.username,
        message: `${user.username} left the chat`
      });
      users.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});