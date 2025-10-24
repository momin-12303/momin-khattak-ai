const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
    constructor() {
        // Replit uses Secrets (Environment Variables)
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error(
                "GEMINI_API_KEY is not set in environment variables. Please set it in Replit Secrets.",
            );
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });
        this.chat = this.model.startChat({
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            text: "You are Momin Khattak AI, a helpful and intelligent AI assistant created by Momin Khattak. You should introduce yourself as Momin Khattak AI and provide helpful, accurate, and friendly responses. Always maintain a professional yet approachable tone.",
                        },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        {
                            text: "Hello! I'm Momin Khattak AI, your intelligent assistant created by Momin Khattak. I'm here to help you with information, answer questions, and assist with various tasks. How can I help you today?",
                        },
                    ],
                },
            ],
        });
    }

    async sendMessage(message) {
        try {
            const result = await this.chat.sendMessage(message);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                message: text,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw new Error(this.handleGeminiError(error));
        }
    }

    handleGeminiError(error) {
        if (error.message.includes("API key not valid")) {
            return "Invalid Gemini API key. Please check your configuration.";
        } else if (error.message.includes("Quota exceeded")) {
            return "API quota exceeded. Please try again later.";
        } else if (error.message.includes("Safety")) {
            return "The message was blocked for safety reasons. Please try rephrasing your question.";
        } else {
            return "Failed to get response from Momin Khattak AI. Please try again.";
        }
    }

    // Method to reset chat history
    resetChat() {
        this.chat = this.model.startChat({
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            text: "You are Momin Khattak AI, a helpful and intelligent AI assistant created by Momin Khattak. You should introduce yourself as Momin Khattak AI and provide helpful, accurate, and friendly responses. Always maintain a professional yet approachable tone.",
                        },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        {
                            text: "Hello! I'm Momin Khattak AI, your intelligent assistant created by Momin Khattak. I'm here to help you with information, answer questions, and assist with various tasks. How can I help you today?",
                        },
                    ],
                },
            ],
        });
    }
}

module.exports = new GeminiService();
