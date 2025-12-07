import React, { useState, useCallback } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface ChatBotProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
  onComplete: (groupId: string, responses: Record<string, string>) => void;
}

interface Message {
  type: 'user' | 'bot';
  content: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ groupId, groupName, onClose, onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: `Welcome to ${groupName}! I'm here to help you join our support group. What made you interested in joining us?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Add user message immediately
      setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

      // Naive bot response (local): echo with a friendly prefix
      const botReply = `Thanks for sharing! "${userMessage}"`;
      setMessages(prev => [...prev, { type: 'bot', content: botReply }]);

      // Check if we should complete the conversation
      const userResponses = messages.reduce((acc, msg, i) => {
        if (msg.type === 'user') {
          acc[`response_${i}`] = msg.content;
        }
        return acc;
      }, {} as Record<string, string>);

      // Add the current user message
      userResponses[`response_${messages.length}`] = userMessage;

      if (Object.keys(userResponses).length >= 2) {
        // Toggle join via REST and store responses locally
        await apiFetch(`/api/groups/${groupId}/toggle`, { method: 'POST' });
        try { localStorage.setItem(`group_join_responses:${groupId}`, JSON.stringify(userResponses)); } catch {}

        onComplete(groupId, userResponses);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setError('Failed to process your message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, groupId, groupName, onComplete]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-rose-600 mr-2" />
            <h3 className="font-semibold">Join {groupName}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 h-96 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex items-start ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-100">●</span>
                <span className="animate-pulse delay-200">●</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              rows={2}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="bg-rose-600 text-white p-2 rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;