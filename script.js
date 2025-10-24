class MominKhattakAI {
    constructor() {
        this.initializeEventListeners();
        this.loadTheme();
        this.loadChatHistory();
    }

    initializeEventListeners() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.clearChatBtn = document.getElementById('clearChat');
        this.themeToggle = document.getElementById('themeToggle');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.historyList = document.getElementById('historyList');

        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.messageInput.addEventListener('input', this.autoResizeTextarea.bind(this));
        this.newChatBtn.addEventListener('click', () => this.startNewChat());
        this.clearChatBtn.addEventListener('click', () => this.clearCurrentChat());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        this.sidebarCloseBtn.addEventListener('click', () => this.toggleSidebar());
        this.clearHistoryBtn.addEventListener('click', () => this.clearChatHistory());

        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.getAttribute('data-prompt');
                this.messageInput.value = prompt;
                this.sendMessage();
            });
        });
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        this.welcomeScreen.style.display = 'none';

        this.addMessage('user', message);
        this.messageInput.value = '';
        this.autoResizeTextarea();

        this.showLoading();

        try {
            const response = await this.sendToServer(message);
            this.addMessage('assistant', response);
            
            this.saveToHistory(message, response);
        } catch (error) {
            this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
            console.error('Error:', error);
        } finally {
            this.hideLoading();
        }
    }

    async sendToServer(message) {
        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.message;
    }

    addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const senderName = sender === 'user' ? 'You' : 'Momin Khattak AI';
        const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';

        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">
                    <i class="${avatarIcon}"></i>
                </div>
                <div class="message-sender">${senderName}</div>
            </div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatMessage(content) {
        if (typeof marked !== 'undefined') {
            return marked.parse(content);
        }
        return content.split('\n').filter(line => line.trim()).map(line => 
            `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`
        ).join('');
    }

    showLoading() {
        this.loadingSpinner.classList.add('show');
        this.sendButton.disabled = true;
    }

    hideLoading() {
        this.loadingSpinner.classList.remove('show');
        this.sendButton.disabled = false;
    }

    async startNewChat() {
        this.showLoading();
        
        try {
            const response = await fetch('/api/chat/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                this.chatMessages.innerHTML = '';
                this.welcomeScreen.style.display = 'flex';
                localStorage.setItem('currentChatId', Date.now().toString());
                
                if (window.innerWidth <= 768) {
                    this.toggleSidebar();
                }
            }
        } catch (error) {
            console.error('Error starting new chat:', error);
            this.chatMessages.innerHTML = '';
            this.welcomeScreen.style.display = 'flex';
            localStorage.setItem('currentChatId', Date.now().toString());
            
            if (window.innerWidth <= 768) {
                this.toggleSidebar();
            }
        } finally {
            this.hideLoading();
        }
    }

    clearCurrentChat() {
        if (confirm('Are you sure you want to clear this chat?')) {
            this.startNewChat();
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleSidebar() {
        document.querySelector('.sidebar').classList.toggle('open');
    }

    saveToHistory(userMessage, aiResponse) {
        const currentChatId = localStorage.getItem('currentChatId') || Date.now().toString();
        localStorage.setItem('currentChatId', currentChatId);
        
        const messages = Array.from(this.chatMessages.children).map(msg => ({
            sender: msg.classList.contains('user') ? 'user' : 'assistant',
            content: msg.querySelector('.message-content').innerHTML
        }));
        
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const existingChatIndex = chatHistory.findIndex(chat => chat.id === currentChatId);
        
        const chatItem = {
            id: currentChatId,
            title: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
            preview: aiResponse.substring(0, 100) + (aiResponse.length > 100 ? '...' : ''),
            timestamp: new Date().toISOString(),
            messages: messages
        };
        
        if (existingChatIndex !== -1) {
            chatHistory[existingChatIndex] = chatItem;
        } else {
            chatHistory.unshift(chatItem);
        }
        
        const limitedHistory = chatHistory.slice(0, 20);
        localStorage.setItem('chatHistory', JSON.stringify(limitedHistory));
        
        this.loadChatHistory();
    }

    loadChatHistory() {
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        this.historyList.innerHTML = chatHistory.map(chat => `
            <div class="history-item" data-id="${chat.id}">
                <div class="history-item-title">${chat.title}</div>
                <div class="history-item-preview">${chat.preview}</div>
            </div>
        `).join('');

        this.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => this.loadChat(item.dataset.id));
        });
    }

    loadChat(chatId) {
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const chat = chatHistory.find(c => c.id === chatId);
        
        if (chat && chat.messages) {
            this.chatMessages.innerHTML = '';
            this.welcomeScreen.style.display = 'none';
            
            chat.messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.sender}`;
                
                const senderName = msg.sender === 'user' ? 'You' : 'Momin Khattak AI';
                const avatarIcon = msg.sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
                
                messageDiv.innerHTML = `
                    <div class="message-header">
                        <div class="message-avatar">
                            <i class="${avatarIcon}"></i>
                        </div>
                        <div class="message-sender">${senderName}</div>
                    </div>
                    <div class="message-content">${msg.content}</div>
                `;
                
                this.chatMessages.appendChild(messageDiv);
            });
            
            localStorage.setItem('currentChatId', chatId);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            
            if (window.innerWidth <= 768) {
                this.toggleSidebar();
            }
        }
    }

    clearChatHistory() {
        if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
            localStorage.removeItem('chatHistory');
            localStorage.removeItem('currentChatId');
            this.historyList.innerHTML = '';
            this.chatMessages.innerHTML = '';
            this.welcomeScreen.style.display = 'flex';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MominKhattakAI();
});
