import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/api';

const LiveChat = ({ userPermissions }) => {
  const [chatRequests, setChatRequests] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAvailabilitySettings, setShowAvailabilitySettings] = useState(false);
  const [availabilitySettings, setAvailabilitySettings] = useState({
    start_hour: 8,
    end_hour: 17,
    enabled: true
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchChatRequests();
    fetchAvailabilitySettings();
    const interval = setInterval(fetchChatRequests, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      pollingIntervalRef.current = setInterval(fetchMessages, 3000); // Poll messages every 3 seconds
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRequests = async () => {
    try {
      const res = await api.get('/api/live-chat/requests');
      if (res.data.success) {
        setChatRequests(res.data.requests);
        // Update selected chat if it exists
        if (selectedChat) {
          const updated = res.data.requests.find(r => r.id === selectedChat.id);
          if (updated) setSelectedChat(updated);
        }
      }
    } catch (error) {
      console.error('Error fetching chat requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilitySettings = async () => {
    try {
      const res = await api.get('/api/live-chat/availability/settings');
      if (res.data.success && res.data.settings) {
        setAvailabilitySettings({
          start_hour: res.data.settings.start_hour || 8,
          end_hour: res.data.settings.end_hour || 17,
          enabled: res.data.settings.enabled !== undefined ? res.data.settings.enabled : true
        });
      }
    } catch (error) {
      console.error('Error fetching availability settings:', error);
    }
  };

  const handleSaveAvailabilitySettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.put('/api/live-chat/availability/settings', availabilitySettings);
      if (res.data.success) {
        alert('Availability settings saved successfully!');
        setShowAvailabilitySettings(false);
        await fetchAvailabilitySettings();
      }
    } catch (error) {
      console.error('Error saving availability settings:', error);
      alert('Failed to save availability settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:00 ${period}`;
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    
    try {
      const res = await api.get(`/api/live-chat/requests/${selectedChat.id}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleAcceptChat = async (requestId) => {
    try {
      const res = await api.post(`/api/live-chat/requests/${requestId}/accept`);
      if (res.data.success) {
        await fetchChatRequests();
        // Auto-select the accepted chat
        const accepted = chatRequests.find(r => r.id === requestId);
        if (accepted) {
          setSelectedChat({ ...accepted, status: 'in_progress', assigned_staff_id: res.data.staffId });
        }
      }
    } catch (error) {
      console.error('Error accepting chat:', error);
      alert('Failed to accept chat request');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSending(true);
      const res = await api.post('/api/live-chat/messages', {
        chat_request_id: selectedChat.id,
        message: newMessage.trim(),
        sender_type: 'staff'
      });

      if (res.data.success) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCloseChat = async (requestId) => {
    if (!confirm('Are you sure you want to close this chat?')) return;

    try {
      const res = await api.post(`/api/live-chat/requests/${requestId}/close`);
      if (res.data.success) {
        await fetchChatRequests();
        if (selectedChat?.id === requestId) {
          setSelectedChat(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error closing chat:', error);
      alert('Failed to close chat');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPurposeLabel = (purpose) => {
    const labels = {
      'schedule_visit': 'Schedule/Visit',
      'donation': 'Donation',
      'event_participation': 'Event Participation',
      'other': 'Other'
    };
    return labels[purpose] || purpose;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = chatRequests.filter(r => r.status === 'pending');
  const inProgressRequests = chatRequests.filter(r => r.status === 'in_progress');
  const closedRequests = chatRequests.filter(r => r.status === 'closed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[#2e2b41]">
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
          Loading chat requests...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 font-telegraf text-[#351E10]">
              <i className="fa-solid fa-comments mr-3 text-[#E5B80B]"></i>
              Live Chat Management
            </h1>
            <p className="text-sm md:text-base font-lora text-[#351E10]">
              Manage visitor chat requests and communicate with visitors in real-time
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Availability Settings button clicked');
                setShowAvailabilitySettings(true);
              }}
              className="bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8B6B21] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all font-telegraf flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-clock"></i>
              Availability Settings
            </button>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <p className="text-xs text-yellow-700 font-telegraf">Pending</p>
              <p className="text-xl font-bold text-yellow-800 font-telegraf">{pendingRequests.length}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-xs text-blue-700 font-telegraf">Active</p>
              <p className="text-xl font-bold text-blue-800 font-telegraf">{inProgressRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Requests List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold font-telegraf text-[#351E10]">
              <i className="fa-solid fa-list mr-2 text-[#E5B80B]"></i>
              Chat Requests
            </h2>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            {chatRequests.length === 0 ? (
              <div className="p-8 text-center">
                <i className="fa-solid fa-comments text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 font-telegraf">No chat requests</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {chatRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => {
                      if (request.status === 'pending') {
                        handleAcceptChat(request.id);
                      } else {
                        setSelectedChat(request);
                      }
                    }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === request.id ? 'bg-[#E5B80B]/10 border-l-4 border-[#E5B80B]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#351E10] truncate font-telegraf">
                          {request.visitor_name}
                        </p>
                        <p className="text-xs text-gray-600 truncate font-telegraf">
                          {request.visitor_email}
                        </p>
                      </div>
                      {request.unread_count > 0 && (
                        <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {request.unread_count > 9 ? '9+' : request.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(request.status)} font-telegraf`}>
                        {request.status === 'pending' ? 'PENDING' : 
                         request.status === 'in_progress' ? 'ACTIVE' : 
                         request.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 font-telegraf">
                        {formatTime(request.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-telegraf">
                      {getPurposeLabel(request.inquiry_purpose)}
                    </p>
                    {request.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptChat(request.id);
                        }}
                        className="mt-2 w-full bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8B6B21] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-telegraf"
                      >
                        Accept Chat
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] text-white p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg font-telegraf truncate">
                    {selectedChat.visitor_name}
                  </h3>
                  <p className="text-sm text-white/90 truncate font-telegraf">
                    {selectedChat.visitor_email}
                  </p>
                  <p className="text-xs text-white/80 mt-1 font-telegraf">
                    {getPurposeLabel(selectedChat.inquiry_purpose)}
                    {selectedChat.purpose_details && ` • ${selectedChat.purpose_details.substring(0, 50)}${selectedChat.purpose_details.length > 50 ? '...' : ''}`}
                  </p>
                </div>
                <button
                  onClick={() => handleCloseChat(selectedChat.id)}
                  className="ml-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors font-telegraf"
                >
                  Close Chat
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fa-solid fa-comments text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 font-telegraf">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'visitor' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.sender_type === 'visitor'
                            ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                            : 'bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap font-telegraf">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_type === 'visitor' ? 'text-gray-500' : 'text-white/80'
                        } font-telegraf`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6B21] focus:border-transparent font-telegraf"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8B6B21] text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed font-telegraf"
                  >
                    {sending ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-paper-plane"></i>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <i className="fa-solid fa-comments text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg font-telegraf mb-2">No chat selected</p>
                <p className="text-gray-400 text-sm font-telegraf">
                  Select a chat request from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Availability Settings Modal */}
      {showAvailabilitySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4" onClick={() => {
          console.log('Modal backdrop clicked');
          setShowAvailabilitySettings(false);
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] text-white p-4 sm:p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-telegraf">Staff Availability Settings</h2>
                <p className="text-sm text-white/90 mt-1 font-telegraf">Set when staff will be available for live chat</p>
              </div>
              <button
                onClick={() => setShowAvailabilitySettings(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <i className="fa-solid fa-times text-white text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSaveAvailabilitySettings} className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={availabilitySettings.enabled}
                  onChange={(e) => setAvailabilitySettings({...availabilitySettings, enabled: e.target.checked})}
                  className="w-5 h-5 text-[#8B6B21] rounded focus:ring-[#8B6B21]"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700 font-telegraf">
                  Enable availability check
                </label>
              </div>

              {availabilitySettings.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-telegraf">
                      Start Hour (24-hour format: 0-23)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={availabilitySettings.start_hour}
                      onChange={(e) => setAvailabilitySettings({...availabilitySettings, start_hour: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6B21] font-telegraf"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1 font-telegraf">
                      Current: {formatHour(availabilitySettings.start_hour)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-telegraf">
                      End Hour (24-hour format: 0-23)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={availabilitySettings.end_hour}
                      onChange={(e) => setAvailabilitySettings({...availabilitySettings, end_hour: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6B21] font-telegraf"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1 font-telegraf">
                      Current: {formatHour(availabilitySettings.end_hour)}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 font-telegraf">
                      <i className="fa-solid fa-info-circle mr-2"></i>
                      Staff will be available from <strong>{formatHour(availabilitySettings.start_hour)}</strong> to <strong>{formatHour(availabilitySettings.end_hour)}</strong>
                    </p>
                  </div>
                </>
              )}

              {!availabilitySettings.enabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 font-telegraf">
                    <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                    When disabled, visitors can request chat at any time
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="flex-1 bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8B6B21] text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 font-telegraf"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAvailabilitySettings(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all font-telegraf"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChat;

