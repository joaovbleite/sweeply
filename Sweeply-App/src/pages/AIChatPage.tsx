import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';

const AIChatPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Sweeply's AI assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { id: Date.now(), text: inputValue, sender: 'user' }]);
      setInputValue('');
      // Placeholder for AI response
      setTimeout(() => {
        setMessages(prev => [...prev, {id: Date.now(), text: "This is a placeholder AI response.", sender: 'ai'}]);
      }, 1000);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <header className="flex items-center p-4 border-b bg-white">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <div className="ml-4">
            <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-sm text-green-500 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              Online
            </p>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIChatPage; 