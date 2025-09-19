const OPENAI_API_KEY = config.OPENAI_API_KEY;
const OPENAI_API_URL = config.OPENAI_API_URL;

let otoData = null;
let productData = null;
async function loadOtOData() {
    try {
        const [dataResponse, productResponse] = await Promise.all([
            fetch('./Data.json'),
            fetch('./ProductData.json')
        ]);
        otoData = await dataResponse.json();
        productData = await productResponse.json();
    } catch (error) {
        console.error('Error loading OtO data:', error);
    }
}

class OtOChatbot {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.quickActions = document.getElementById('quickActions');
        this.messageHistory = [];
        
        this.initializeEventListeners();
        this.loadDataAndInitialize();
    }
    
    async loadDataAndInitialize() {
        await loadOtOData();
        this.addMessage("Hi! I'm your OtO smart sprinkler assistant. I can help you with setup, troubleshooting, product info, and more. How can I help you today?", 'bot');
        this.messageHistory.push({ role: 'assistant', content: "Hi! I'm your OtO smart sprinkler assistant. I can help you with setup, troubleshooting, product info, and more. How can I help you today?" });
    }
    
    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.messageHistory.push({ role: 'user', content: message });
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        
        this.showTypingIndicator();
        
        try {
            const response = await this.getOpenAIResponse(message);
            this.hideTypingIndicator();
            
            const isTableResponse = response.includes('<table>') || 
                                  (response.includes('|') && response.includes('---')) ||
                                  this.isProductComparisonRequest(message);
            
            if (isTableResponse) {
                this.addMessage(response, 'bot');
            } else {
                this.addTypingMessage(response, 'bot');
            }
            
            this.messageHistory.push({ role: 'assistant', content: response });
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage("I'm sorry, I'm having trouble connecting right now. Please try again in a moment.", 'bot');
            console.error('OpenAI API Error:', error);
        }
    }
    
    sendQuickMessage(message) {
        this.messageInput.value = message;
        this.sendMessage();
    }
    
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        
        const processedText = this.convertMarkdownTableToHTML(text);
        messageText.innerHTML = processedText;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        content.appendChild(messageText);
        content.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addTypingMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message typing-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text typing-text';
        messageText.innerHTML = '';
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        content.appendChild(messageText);
        content.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.typeText(messageText, text);
    }
    
    typeText(element, text) {
        let index = 0;
        const speed = 15;
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                element.innerHTML = text.substring(0, index + 1);
                index++;
                this.scrollToBottom();
            } else {
                clearInterval(typeInterval);
                element.classList.remove('typing-text');
            }
        }, speed);
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const typingText = document.createElement('div');
        typingText.className = 'message-text';
        typingText.innerHTML = 'OtO is typing <div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
        
        content.appendChild(typingText);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    async getOpenAIResponse(message) {
        if (!otoData || !productData) {
            return "I'm still loading the OtO information. Please try again in a moment.";
        }

        const isComparisonRequest = this.isProductComparisonRequest(message);
        const systemPrompt = `You are a helpful customer support assistant for OtO Inc., a smart sprinkler system company. 

Here is the complete company information:
${JSON.stringify(otoData, null, 2)}

Here is the detailed product information:
${JSON.stringify(productData, null, 2)}

Your role:
- ONLY answer questions about OtO smart sprinkler systems, lawn care, gardening, or water management
- For ANY question not related to OtO, plants, gardening, or lawn care, respond with a playful joke that relates the question to plants, gardening, or OtO products
- Be friendly, professional, and concise
- If you don't know something specific about OtO, say so and offer to help with what you do know
- Always maintain the helpful, customer-focused tone of OtO's brand
- Use emojis sparingly but appropriately (🌱, 💧, 🔧, etc.)

IMPORTANT: Never give serious answers to non-OtO related questions. Always turn them into plant/gardening/OtO-themed jokes instead.

IMPORTANT FORMATTING RULES:
- NEVER use markdown formatting like **bold**, *italic*, ### headers, or ## headers
- NEVER use asterisks (*) for bullet points or emphasis
- NEVER use double asterisks (**) for bold text
- NEVER use single asterisks (*) for italic text
- NEVER use hash symbols (#) for headers
- Use simple text formatting only
- For step-by-step instructions, use numbered format: 1. First step, 2. Second step, etc.
- For regular lists, use simple dashes (-) or numbers (1. 2. 3.)
- For product comparisons, ALWAYS format as HTML tables
- Keep responses clean and readable with plain text only
- NEVER mention that you're using HTML tables or any technical formatting details
- Write all text in normal, unformatted style

${isComparisonRequest ? 'SPECIAL INSTRUCTION: Since this appears to be a product comparison request, format your response as a markdown table comparing the products mentioned. Use | to separate columns and --- to separate header from data rows. Do not include any introductory text or emojis - just provide the table directly.' : ''}

Current conversation history: ${JSON.stringify(this.messageHistory, null, 2)}

Respond to the user's question: "${message}"`;

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    }
                ],
                max_tokens: 1500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    isProductComparisonRequest(message) {
        const comparisonKeywords = [
            'compare', 'comparison', 'vs', 'versus', 'difference', 'differences',
            'which is better', 'which one', 'table', 'chart', 'specs', 'specifications'
        ];
        const lowerMessage = message.toLowerCase();
        return comparisonKeywords.some(keyword => lowerMessage.includes(keyword));
    }
    
    convertMarkdownTableToHTML(text) {
        const lines = text.split('\n');
        const tableLines = [];
        let inTable = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.includes('|') && line.length > 0) {
                if (!inTable) {
                    inTable = true;
                }
                tableLines.push(line);
            } else if (inTable && line.length === 0) {
                continue;
            } else if (inTable) {
                break;
            }
        }
        
        if (tableLines.length < 2) {
            return text;
        }
        
        let html = '<table><thead><tr>';
        let isFirstRow = true;
        let hasHeader = false;
        
        for (let i = 0; i < tableLines.length; i++) {
            const line = tableLines[i];
            
            if (line.match(/^[\s\|\-]+$/)) {
                hasHeader = true;
                continue;
            }
            
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
            
            if (cells.length === 0) continue;
            
            if (isFirstRow) {
                cells.forEach(cell => {
                    html += `<th>${cell}</th>`;
                });
                html += '</tr></thead><tbody>';
                isFirstRow = false;
            } else {
                html += '<tr>';
                cells.forEach(cell => {
                    html += `<td>${cell}</td>`;
                });
                html += '</tr>';
            }
        }
        
        html += '</tbody></table>';
        
        const tableStart = text.indexOf(tableLines[0]);
        const tableEnd = text.indexOf(tableLines[tableLines.length - 1]) + tableLines[tableLines.length - 1].length;
        const beforeTable = text.substring(0, tableStart);
        const afterTable = text.substring(tableEnd);
        
        return beforeTable + html + afterTable;
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

let chatbotInstance = null;

function sendQuickMessage(message) {
    if (chatbotInstance) {
        chatbotInstance.sendQuickMessage(message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    chatbotInstance = new OtOChatbot();
});

document.addEventListener('DOMContentLoaded', () => {
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
    });
    
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('focus', () => {
        messageInput.parentElement.style.borderColor = '#10b981';
        messageInput.parentElement.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
    });
    
    messageInput.addEventListener('blur', () => {
        messageInput.parentElement.style.borderColor = '#e5e7eb';
        messageInput.parentElement.style.boxShadow = 'none';
    });
});