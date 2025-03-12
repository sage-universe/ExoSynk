document.addEventListener('DOMContentLoaded', () => {
    // Mock data (replace with real data from backend)
    const chats = [
        {
            id: 1,
            name: "John Doe",
            lastMessage: "Hello! How are you?",
            unread: 2,
            online: true
        },
        // Add more chat objects
    ];

    // Initialize chat list
    const chatList = document.querySelector('.chat-list');
    
    // Message sending functionality
    document.querySelector('.send-btn').addEventListener('click', sendMessage);
    
    // Call buttons
    document.querySelectorAll('.call-btn, .video-call-btn').forEach(btn => {
        btn.addEventListener('click', initiateCall);
    });

    function sendMessage() {
        const input = document.querySelector('.message-input input');
        const message = input.value.trim();
        
        if(message) {
            const messagesContainer = document.querySelector('.messages-container');
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const messageElement = document.createElement('div');
            messageElement.className = 'message sent';
            messageElement.innerHTML = `
                <div class="message-content">
                    ${message}
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
            
            messagesContainer.appendChild(messageElement);
            input.value = '';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    function initiateCall(e) {
        const isVideoCall = e.target.classList.contains('video-call-btn');
        alert(`Initiating ${isVideoCall ? 'video' : 'voice'} call...`);
        // Add WebRTC logic here
    }

    function loadChatList() {
        chatList.innerHTML = chats.map(chat => `
            <a href="#" class="list-group-item list-group-item-action border-0 chat-item">
                <div class="d-flex align-items-center">
                    <div class="position-relative">
                        <img src="https://via.placeholder.com/40" class="rounded-circle" alt="User">
                        ${chat.online ? '<span class="badge bg-success position-absolute bottom-0 end-0"></span>' : ''}
                    </div>
                    <div class="ms-3">
                        <h6 class="mb-0">${chat.name}</h6>
                        <small class="text-muted">${chat.lastMessage}</small>
                    </div>
                    ${chat.unread > 0 ? `
                    <div class="ms-auto">
                        <span class="badge bg-success rounded-pill">${chat.unread}</span>
                    </div>` : ''}
                </div>
            </a>
        `).join('');
    }

    // Initial load
    loadChatList();
});