const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });

server.on('connection', socket => {
    console.log('New client connected');

    socket.on('message', message => {
        try {
            const data = JSON.parse(message); // Parse incoming JSON

            // Broadcast the message to all connected clients
            server.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log("✅ Server running at ws://localhost:3000");
