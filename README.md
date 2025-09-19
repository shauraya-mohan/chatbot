# OtO Smart Sprinkler AI Chatbot

A modern, intelligent chatbot interface for OtO Inc.'s smart sprinkler systems, built with OpenAI GPT-4o integration.

## 🌱 Features

- **AI-Powered Responses**: Uses OpenAI GPT-4o for intelligent, context-aware conversations
- **Brand-Focused**: Only answers OtO-related questions, turns off-topic queries into plant-themed jokes
- **Product Comparisons**: Automatic HTML table generation for product comparisons
- **Typing Animation**: Smooth character-by-character text display for engaging UX
- **Quick Actions**: Pre-built buttons for common queries (Setup, Coverage, Troubleshooting, Pricing)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean interface matching OtO's brand theme with green color scheme

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/shauraya-mohan/chatbot.git
   cd chatbot
   ```

2. **Set up your OpenAI API key**
   - Copy `config.example.js` to `config.js`
   - Replace `your-openai-api-key-here` with your actual OpenAI API key

3. **Run the application**
   ```bash
   python3 -m http.server 8000
   ```
   - Open your browser and go to `http://localhost:8000`

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI Integration**: OpenAI GPT-4o API
- **Styling**: Custom CSS with modern animations
- **Data**: JSON files for company and product information

## 📁 Project Structure

```
chatbot/
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # Core chatbot logic
├── config.js           # API configuration (not in repo)
├── config.example.js   # Configuration template
├── Data.json           # Company information
├── ProductData.json    # Product specifications
├── image.png           # Background image
└── README.md           # This file
```

## 🔧 Configuration

The chatbot uses a configuration file (`config.js`) to manage API keys and settings. This file is excluded from the repository for security.

**Required Environment Variables:**
- `OPENAI_API_KEY`: Your OpenAI API key

## 🎯 Key Features Explained

### Smart Response System
- Analyzes user queries for product comparison requests
- Displays tables instantly for comparisons
- Uses typing animation for regular text responses

### Brand Personality
- Maintains focus on OtO products and lawn care
- Responds to unrelated questions with plant/gardening-themed jokes
- Professional yet friendly tone

### Data Integration
- Loads company information from `Data.json`
- Uses `ProductData.json` for detailed product specifications
- Maintains conversation history for context

## 🌐 Live Demo

The chatbot is designed to be deployed on any static hosting service. Simply upload the files and ensure your `config.js` file contains the correct API key.

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OtO Inc. for the product information and brand guidelines
- OpenAI for the GPT-4o API
- Font Awesome for the icons
- Google Fonts for the Inter font family

---

**Note**: This is a demonstration project showcasing modern web development techniques and AI integration for customer support applications.