import React, { useState, useEffect } from 'react';

interface SupportMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  citations?: string[];
  functionsCalled?: string[];
}

interface SupportAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrderId?: string;
}

export const SupportAssistant: React.FC<SupportAssistantProps> = ({ 
  isOpen, 
  onClose, 
  currentOrderId 
}) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        id: 'welcome',
        text: "Hi! I'm Alex, your customer support specialist. How can I help you today?",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: SupportMessage = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: {
            orderId: currentOrderId
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();
      
      const assistantMessage: SupportMessage = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        isUser: false,
        timestamp: new Date(),
        intent: data.intent,
        confidence: data.confidence,
        citations: data.citations,
        functionsCalled: data.functionsCalled
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Sorry, I\'m having trouble connecting right now. Please try again later.');
      console.error('Assistant error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      text: "Hi! I'm Alex, your customer support specialist. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Support Assistant</h2>
            <p className="text-sm text-gray-600">Alex - Customer Support Specialist</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearChat}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Chat
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                  {message.confidence && (
                    <span className="ml-2">
                      (Confidence: {Math.round(message.confidence * 100)}%)
                    </span>
                  )}
                </div>
                {message.citations && message.citations.length > 0 && (
                  <div className="text-xs opacity-70 mt-1">
                    Sources: {message.citations.join(', ')}
                  </div>
                )}
                {message.functionsCalled && message.functionsCalled.length > 0 && (
                  <div className="text-xs opacity-70 mt-1">
                    Functions: {message.functionsCalled.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span className="text-sm text-gray-600">Alex is typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          {error && (
            <div className="text-red-600 text-sm mb-2 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about orders, products, or policies..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Try asking: "What's my order status?" or "What's your return policy?"
          </p>
        </div>
      </div>
    </div>
  );
};
