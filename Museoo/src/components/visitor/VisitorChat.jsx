import React, { useState, useRef, useEffect } from 'react';
import api from '../../config/api';

const VisitorChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('faq'); // 'faq' or 'live-chat'
  const [showLiveChatForm, setShowLiveChatForm] = useState(false);
  const [liveChatRequest, setLiveChatRequest] = useState({
    visitor_name: '',
    visitor_email: '',
    inquiry_purpose: '',
    purpose_details: ''
  });
  const [currentChatRequestId, setCurrentChatRequestId] = useState(null);
  const [staffAvailable, setStaffAvailable] = useState(false);
  const [availabilitySettings, setAvailabilitySettings] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! 👋 I'm here to help you learn more about the City Museum of Cagayan de Oro. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Check staff availability on mount and periodically
  useEffect(() => {
    checkStaffAvailability();
    const interval = setInterval(checkStaffAvailability, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Poll for new messages if in live chat mode
  useEffect(() => {
    if (mode === 'live-chat' && currentChatRequestId && liveChatRequest.visitor_email) {
      fetchMessages();
      pollingIntervalRef.current = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [mode, currentChatRequestId, liveChatRequest.visitor_email]);

  const checkStaffAvailability = async () => {
    try {
      const res = await api.get('/api/live-chat/availability');
      if (res.data.success) {
        setStaffAvailable(res.data.available);
        // Update the button text with custom hours if available
        if (res.data.settings && !res.data.available) {
          // The message already contains the custom hours
        }
      }
    } catch (error) {
      console.error('Error checking staff availability:', error);
    }
  };

  const fetchMessages = async () => {
    if (!currentChatRequestId || !liveChatRequest.visitor_email) return;
    
    try {
      const res = await api.get(
        `/api/live-chat/visitor/${encodeURIComponent(liveChatRequest.visitor_email)}/requests/${currentChatRequestId}/messages`
      );
      if (res.data.success) {
        const formattedMessages = res.data.messages.map(msg => ({
          id: msg.id,
          type: msg.sender_type === 'visitor' ? 'user' : 'ai',
          content: msg.message,
          timestamp: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // FAQ database
  const faqDatabase = {
    location: {
      keywords: ['location', 'where', 'address', 'located', 'find', 'map'],
      answer: "📍 The City Museum of Cagayan de Oro is located beside Gaston Park in Cagayan de Oro City, Philippines. The museum is housed in the historic water reservoir building constructed in 1922, making it the oldest public structure in the city. You can find us on the map in the Contact section of our website!"
    },
    hours: {
      keywords: ['hours', 'time', 'open', 'closed', 'schedule', 'operating'],
      answer: "🕐 Our operating hours are Monday to Friday, 8:00 AM to 5:00 PM. We're closed on weekends and holidays. For special visits or group tours, please schedule in advance through our 'Schedule Your Visit' page!"
    },
    history: {
      keywords: ['history', 'historic', 'built', 'when', 'established', 'origin'],
      answer: "🏛️ The City Museum was originally built as a water reservoir in 1922, making it the oldest public structure in Cagayan de Oro. It was transformed into a museum in 2008 to preserve and showcase the city's rich cultural and historical heritage. The building stands as an architectural gem beside the historic Gaston Park."
    },
    exhibits: {
      keywords: ['exhibit', 'exhibits', 'display', 'show', 'collection', 'artifacts'],
      answer: "🎨 Our museum features carefully curated photographs, artifacts, and exhibits that reflect the diverse history and unique identity of Cagayan de Oro. You can explore our current exhibits in the Exhibits section of our website. We regularly update our collections to showcase different aspects of our city's heritage!"
    },
    visit: {
      keywords: ['visit', 'tour', 'schedule', 'booking', 'appointment', 'come'],
      answer: "📅 To schedule your visit, please use our 'Schedule Your Visit' feature on the homepage. You can book individual visits or group tours. We welcome visitors of all ages and offer educational programs for schools and organizations!"
    },
    donation: {
      keywords: ['donate', 'donation', 'contribute', 'support', 'give'],
      answer: "💰 We greatly appreciate your support! You can make donations through our 'Make a Donation' page. We accept monetary donations, loan artifacts, and donated artifacts. Your contributions help us preserve and showcase Cagayan de Oro's cultural heritage for future generations!"
    },
    contact: {
      keywords: ['contact', 'phone', 'email', 'reach', 'call', 'message'],
      answer: "📞 You can reach us at:\n• Phone: +63 88 123 4567\n• Email: cdocitymuseum@cagayandeoro.gov.ph\n• Operating Hours: Mon-Fri, 8:00 AM - 5:00 PM\n\nYou can also find us on social media or visit the Contact section for more details!"
    },
    events: {
      keywords: ['event', 'events', 'program', 'activity', 'happening'],
      answer: "🎉 We regularly host cultural events, educational programs, and special exhibitions. Check out our Events section to see upcoming activities. You can register for events that interest you and stay updated on our latest programs!"
    },
    archive: {
      keywords: ['archive', 'digital', 'collection', 'records', 'documents'],
      answer: "📚 Our Digital Archive contains a vast collection of historical documents, photographs, and cultural materials. You can explore our digital archive through the 'Digital Archive' section on our website. It's a great resource for researchers and history enthusiasts!"
    },
    admission: {
      keywords: ['admission', 'fee', 'price', 'cost', 'ticket', 'free', 'charge'],
      answer: "🎫 Admission to the City Museum is free! We believe in making cultural heritage accessible to everyone. However, we do encourage advance scheduling for your visit, especially for groups, to ensure the best experience for all visitors."
    },
    parking: {
      keywords: ['parking', 'park', 'car', 'vehicle'],
      answer: "🚗 Parking is available near Gaston Park. We recommend arriving a few minutes early to find parking, especially during peak hours. The museum is also easily accessible by public transportation."
    },
    accessibility: {
      keywords: ['accessibility', 'wheelchair', 'disabled', 'handicap', 'accessible'],
      answer: "♿ The museum is committed to being accessible to all visitors. We have facilities to accommodate visitors with disabilities. If you have specific accessibility needs, please contact us in advance so we can ensure the best experience for your visit!"
    }
  };

  const findAnswer = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check each FAQ category
    for (const [category, data] of Object.entries(faqDatabase)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return data.answer;
      }
    }

    // Default response if no match
    return "I'm here to help! I can answer questions about:\n\n📍 Location and address\n🕐 Operating hours\n🏛️ Museum history\n🎨 Exhibits and collections\n📅 Scheduling a visit\n💰 Donations\n📞 Contact information\n🎉 Events and programs\n📚 Digital archive\n🎫 Admission fees\n🚗 Parking\n♿ Accessibility\n\nWhat would you like to know?";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (mode === 'live-chat' && currentChatRequestId) {
      // Send message in live chat
      try {
        setIsLoading(true);
        await api.post(
          `/api/live-chat/visitor/${encodeURIComponent(liveChatRequest.visitor_email)}/requests/${currentChatRequestId}/messages`,
          { message: inputMessage.trim() }
        );
        setInputMessage('');
        fetchMessages(); // Refresh messages
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // FAQ mode
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: inputMessage.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      setTimeout(() => {
        const answer = findAnswer(inputMessage);
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 500);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: question,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      setTimeout(() => {
        const answer = findAnswer(question);
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 500);
    }, 100);
  };

  const handleRequestLiveChat = () => {
    setShowLiveChatForm(true);
    setMode('live-chat');
  };

  const handleSubmitLiveChatRequest = async (e) => {
    e.preventDefault();
    
    if (!liveChatRequest.visitor_name || !liveChatRequest.visitor_email || !liveChatRequest.inquiry_purpose) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post('/api/live-chat/request', liveChatRequest);
      
      if (res.data.success) {
        setCurrentChatRequestId(res.data.chat_request_id);
        setShowLiveChatForm(false);
        setMessages([
          {
            id: 1,
            type: 'ai',
            content: `Thank you, ${liveChatRequest.visitor_name}! Your chat request has been submitted. A staff member will respond shortly. You can start typing your message below.`,
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Error submitting chat request:', error);
      alert(error.response?.data?.message || 'Failed to submit chat request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToFAQ = () => {
    setMode('faq');
    setShowLiveChatForm(false);
    setCurrentChatRequestId(null);
    setLiveChatRequest({
      visitor_name: '',
      visitor_email: '',
      inquiry_purpose: '',
      purpose_details: ''
    });
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "Hello! 👋 I'm here to help you learn more about the City Museum of Cagayan de Oro. What would you like to know?",
        timestamp: new Date()
      }
    ]);
  };

  const quickQuestions = [
    "Where is the museum located?",
    "What are your operating hours?",
    "Is admission free?",
    "How can I schedule a visit?"
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8B6B21] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <svg 
            className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {mode === 'live-chat' ? 'Live Chat with Staff' : 'Museum Assistant'}
                </h3>
                <p className="text-xs text-white/90">
                  {mode === 'live-chat' ? 'Real-time support' : 'Ask me anything!'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                handleBackToFAQ();
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Live Chat Request Form */}
          {showLiveChatForm && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <form onSubmit={handleSubmitLiveChatRequest} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={liveChatRequest.visitor_name}
                    onChange={(e) => setLiveChatRequest({...liveChatRequest, visitor_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B6B21]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={liveChatRequest.visitor_email}
                    onChange={(e) => setLiveChatRequest({...liveChatRequest, visitor_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B6B21]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Purpose of Inquiry <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={liveChatRequest.inquiry_purpose}
                    onChange={(e) => setLiveChatRequest({...liveChatRequest, inquiry_purpose: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B6B21]"
                    required
                  >
                    <option value="">Select purpose...</option>
                    <option value="schedule_visit">Schedule/Visit</option>
                    <option value="donation">Donation</option>
                    <option value="event_participation">Event Participation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {liveChatRequest.inquiry_purpose && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Additional Details
                    </label>
                    <textarea
                      value={liveChatRequest.purpose_details}
                      onChange={(e) => setLiveChatRequest({...liveChatRequest, purpose_details: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B6B21]"
                      rows="2"
                      placeholder="Please provide more details about your inquiry..."
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-[#D4AF37] hover:to-[#8B6B21] transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Submitting...' : 'Start Chat'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToFAQ}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {mode === 'faq' && messages.length === 1 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 mb-2">
                  💬 Need to speak with a staff member? Click below to start a live chat!
                </p>
                <button
                  onClick={handleRequestLiveChat}
                  disabled={!staffAvailable}
                  className="w-full bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-[#D4AF37] hover:to-[#8B6B21] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {staffAvailable 
                    ? '💬 Chat with Staff' 
                    : availabilitySettings 
                      ? `⏰ Staff Available ${availabilitySettings.start_time} - ${availabilitySettings.end_time}`
                      : '⏰ Staff Available 8 AM - 5 PM'}
                </button>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] text-white'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/80' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions - Only show in FAQ mode */}
          {mode === 'faq' && messages.length === 1 && (
            <div className="px-4 pt-2 pb-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2 font-medium">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full hover:bg-[#8B6B21]/10 hover:border-[#8B6B21] transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
            {mode === 'live-chat' && !currentChatRequestId && (
              <div className="mb-2 text-xs text-gray-600">
                Please fill out the form above to start chatting with staff.
              </div>
            )}
            <div className="flex items-end space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={mode === 'live-chat' ? 'Type your message...' : 'Ask about the museum...'}
                disabled={mode === 'live-chat' && !currentChatRequestId}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B6B21] focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading || (mode === 'live-chat' && !currentChatRequestId)}
                className="bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8B6B21] text-white p-2 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            {mode === 'live-chat' && (
              <button
                type="button"
                onClick={handleBackToFAQ}
                className="mt-2 text-xs text-[#8B6B21] hover:underline"
              >
                ← Back to FAQ
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
};

export default VisitorChat;
