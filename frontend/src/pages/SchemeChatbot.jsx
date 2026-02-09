import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2 } from "lucide-react";
import axios from "axios";

export default function SchemeChatbot() {
    const [messages, setMessages] = useState([
        {
            role: "bot",
            content: "नमस्कार! 🙏 मैं आपकी सरकारी योजनाओं के बारे में सहायता कर सकता हूं।\n\nआप मुझसे पूछ सकते हैं:\n• किसी योजना की पात्रता\n• आवश्यक दस्तावेज\n• आवेदन प्रक्रिया\n\nउदाहरण: \"आयुष्मान भारत के लिए क्या पात्रता है?\""
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'hi-IN';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    // Toggle voice input
    const toggleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert("आपके ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Send message
    const sendMessage = async (e) => {
        e?.preventDefault();

        if (!inputText.trim() || isLoading) return;

        const userMessage = inputText.trim();
        setInputText("");

        // Add user message
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await axios.post('/api/chat', {
                message: userMessage
            });

            const botReply = response.data.reply || "क्षमा करें, कोई उत्तर नहीं मिला";

            setMessages(prev => [...prev, { role: "bot", content: botReply }]);

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                role: "bot",
                content: "क्षमा करें, तकनीकी समस्या है। कृपया बाद में पुनः प्रयास करें।"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Quick suggestion buttons
    const suggestions = [
        "आयुष्मान भारत",
        "PM आवास योजना",
        "किसान सम्मान निधि",
        "मुद्रा लोन"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4">
            <div className="max-w-2xl mx-auto h-[calc(100vh-2rem)] flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Bot className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">सरकारी योजना सहायक</h1>
                            <p className="text-sm text-blue-100">Government Schemes Chatbot</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-4 ${message.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    {message.role === 'bot' && (
                                        <Bot className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                    </div>
                                    {message.role === 'user' && (
                                        <User className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-4">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>सोच रहा हूं...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length === 1 && (
                    <div className="bg-white px-4 py-2 border-t">
                        <p className="text-xs text-gray-500 mb-2">जल्दी पूछें:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((text, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInputText(text + " के बारे में बताएं")}
                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-full transition-colors"
                                >
                                    {text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <form onSubmit={sendMessage} className="bg-white border-t rounded-b-2xl p-4">
                    <div className="flex items-center gap-2">
                        {/* Voice Input Button */}
                        <button
                            type="button"
                            onClick={toggleVoiceInput}
                            className={`p-3 rounded-full transition-colors ${isListening
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>

                        {/* Text Input */}
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="अपना सवाल हिंदी में लिखें..."
                            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isLoading}
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>

                    {isListening && (
                        <p className="text-center text-sm text-red-500 mt-2 animate-pulse">
                            🎤 सुन रहा हूं... बोलें
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
