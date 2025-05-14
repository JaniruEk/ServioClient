import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const ChatWidget = ({ isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('user-' + Math.random().toString(36).substring(2, 9));
  const messagesEndRef = useRef(null);
  const chatURL = 'https://game-parrot-trivially.ngrok-free.app/chat';
  
  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          text: "Hello there! How can I assist you today with Servio's services?", 
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Don't show chat widget if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Get current user info
      const auth = getAuth();
      const user = auth.currentUser;
      const email = user ? user.email : 'guest@servio.com';
      const displayName = user ? user.displayName : 'Guest';
      
      // Send message to chat API
      const response = await axios.post(chatURL, {
        message: inputText,
        conversation_id: conversationId,
        user_info: {
          email,
          name: displayName,
          additionalProp1: {}
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Add response message
      if (response.data && response.data.message) {
        const botMessage = {
          text: response.data.message,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Button */}
      <motion.button
        onClick={toggleChat}
        className={`rounded-full p-3 shadow-lg flex items-center justify-center transition-all ${
          isOpen ? 'bg-red-600 rotate-180' : 'bg-red-500 hover:bg-red-600'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-white" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-16 right-0 w-80 md:w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-red-600 p-4 text-white">
              <h3 className="font-bold text-lg flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Servio Support
              </h3>
            </div>

            {/* Messages Container */}
            <div className="h-80 p-4 overflow-y-auto bg-gray-800">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isUser
                        ? 'bg-red-600 text-white rounded-br-none'
                        : msg.isError
                        ? 'bg-red-800 text-white rounded-bl-none'
                        : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-700 text-white p-3 rounded-lg rounded-bl-none max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md py-2 px-3 text-white focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-r-md transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoading}
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;