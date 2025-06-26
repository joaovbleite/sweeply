import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { openaiService, ChatMessage } from '@/lib/services/openaiService';

const AIChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! I'm Sweeply's AI assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: ChatMessage = { 
        id: Date.now(), 
        text: inputValue, 
        sender: 'user' 
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);
      
      try {
        // Get AI response from OpenAI service
        const aiResponse = await openaiService.sendMessage([...messages, userMessage]);
        
        // Add AI response to messages
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now(), 
            text: aiResponse, 
            sender: 'ai' 
          }
        ]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now(), 
            text: "Sorry, I encountered an error. Please try again later.", 
            sender: 'ai' 
          }
        ]);
      } finally {
        setIsLoading(false);
      }
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
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-sm px-4 py-2 flex items-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          
          {/* Invisible div for scrolling to bottom */}
          <div ref={messagesEndRef} />
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
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 ${
                isLoading || !inputValue.trim() 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-full transition-colors`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIChatPage; 