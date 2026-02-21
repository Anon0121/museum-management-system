import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";

const Dashboard = ({ userPermissions, setActiveTab }) => {
  const [stats, setStats] = useState({
    visitors: 0,
    schedules: 0,
    events: 0,
    exhibits: 0,
    culturalObjects: 0,
    donations: 0,
    archives: 0,
    todayVisitors: 0,
    todayBookings: 0,
    pendingDonations: 0,
    recentBookings: [],
    recentDonations: [],
    recentActivities: [],
    todayScheduleVisits: [],
    scheduledMeetings: [],
    pendingChatRequests: 0,
    recentChatRequests: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/stats/summary");
      setStats(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNotificationClick = (type) => {
    setSelectedNotification(type);
    setShowDetailModal(true);
  };

  const getNotificationData = () => {
    switch (selectedNotification) {
      case 'bookings':
        return {
          title: 'Recent Bookings',
          icon: 'fa-calendar-check',
          items: stats.recentBookings || [],
          emptyMessage: 'No recent bookings',
          renderItem: (item) => (
            <div key={item.booking_id || item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-[#351E10] truncate" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.first_name && item.last_name 
                    ? `${item.first_name} ${item.last_name}`
                    : item.visitor_name || 'Unknown Visitor'
                  }
                </p>
                <p className="text-xs text-gray-600 mt-1" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {formatDate(item.date)} at {item.time_slot}
                </p>
                <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.type === 'group' ? 'Group Visit' : 'Individual Visit'}
                  {item.institution && item.type === 'group' && ` • ${item.institution}`}
                  {item.total_visitors && ` • ${item.total_visitors} visitor${item.total_visitors > 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-4">
                <span className={`px-3 py-1 rounded-lg font-semibold text-xs ${
                  item.status === 'approved' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : item.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : item.status === 'checked-in'
                    ? 'bg-blue-100 text-blue-700'
                    : item.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`} style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.status === 'approved' ? 'APPROVED' : (item.status || 'pending').toUpperCase()}
                </span>
                <span className="text-xs text-gray-500" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {formatTimeAgo(item.created_at)}
                </span>
              </div>
            </div>
          )
        };
      case 'donations':
        return {
          title: 'Recent Donation Requests',
          icon: 'fa-hand-holding-heart',
          items: stats.recentDonations || [],
          emptyMessage: 'No recent donation requests',
          renderItem: (item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-[#351E10] truncate" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.donor_name || 'Unknown Donor'}
                </p>
                <p className="text-xs text-gray-600 mt-1" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.type === 'monetary' && item.amount ? `₱${parseFloat(item.amount).toLocaleString()}` : 
                   item.item_description ? item.item_description.substring(0, 60) + (item.item_description.length > 60 ? '...' : '') :
                   item.type || 'Donation'}
                </p>
                <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.type === 'monetary' ? 'Monetary Donation' : 
                   item.type === 'artifact' ? 'Artifact Donation' :
                   item.type === 'loan' ? 'Loan Artifact' : 'Donation'}
                  {item.preferred_visit_date && ` • ${formatDate(item.preferred_visit_date)}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  item.processing_stage === 'request_meeting' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : item.processing_stage === 'schedule_meeting'
                    ? 'bg-blue-100 text-blue-700'
                    : item.processing_stage === 'finished_meeting'
                    ? 'bg-orange-100 text-orange-700'
                    : item.processing_stage === 'city_hall'
                    ? 'bg-purple-100 text-purple-700'
                    : item.processing_stage === 'complete'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`} style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.processing_stage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                </span>
                <span className="text-xs text-gray-500" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {formatTimeAgo(item.created_at)}
                </span>
              </div>
            </div>
          )
        };
      case 'events':
        return {
          title: 'Coming Events',
          icon: 'fa-calendar-week',
          items: (stats.recentActivities || []).filter(a => a.type === 'event'),
          emptyMessage: 'No upcoming events',
          renderItem: (item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-[#351E10] truncate" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.title || 'Untitled Event'}
                </p>
                <p className="text-xs text-gray-600 mt-1" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.start_date ? formatDate(item.start_date) : 'Date TBA'}
                  {item.location && ` • ${item.location}`}
                </p>
                <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.description ? item.description.substring(0, 80) + (item.description.length > 80 ? '...' : '') : 'No description'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-4">
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  EVENT
                </span>
                <span className="text-xs text-gray-500" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {formatTimeAgo(item.created_at)}
                </span>
              </div>
            </div>
          )
        };
      case 'meetings':
        return {
          title: 'Scheduled Meetings',
          icon: 'fa-calendar-check',
          items: stats.scheduledMeetings || [],
          emptyMessage: 'No scheduled meetings',
          renderItem: (item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-[#351E10] truncate" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.donor_name || 'Unknown Donor'}
                </p>
                <p className="text-xs text-gray-600 mt-1" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.scheduled_date ? formatDate(item.scheduled_date) : 
                   item.preferred_visit_date ? formatDate(item.preferred_visit_date) : 'No date'}
                  {item.scheduled_time && ` at ${item.scheduled_time}`}
                  {item.preferred_visit_time && !item.scheduled_time && ` at ${item.preferred_visit_time}`}
                </p>
                <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.type === 'monetary' ? 'Monetary Donation' : 
                   item.type === 'artifact' ? 'Artifact Donation' :
                   item.type === 'loan' ? 'Loan Artifact' : 'Donation Meeting'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  item.processing_stage === 'schedule_meeting' 
                    ? 'bg-blue-100 text-blue-700' 
                    : item.processing_stage === 'finished_meeting'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-700'
                }`} style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.processing_stage === 'schedule_meeting' ? 'Scheduled' :
                   item.processing_stage === 'finished_meeting' ? 'Completed' : 'Meeting'}
                </span>
                <span className="text-xs text-gray-500" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.scheduled_date ? formatTimeAgo(item.scheduled_date) : 
                   item.preferred_visit_date ? formatTimeAgo(item.preferred_visit_date) : ''}
                </span>
              </div>
            </div>
          )
        };
      case 'chat':
        const getPurposeLabel = (purpose) => {
          const labels = {
            'schedule_visit': 'Schedule/Visit',
            'donation': 'Donation',
            'event_participation': 'Event Participation',
            'other': 'Other'
          };
          return labels[purpose] || purpose;
        };
        return {
          title: 'Chat Requests',
          icon: 'fa-comments',
          items: (stats.recentChatRequests || []).filter(r => r.status === 'pending'),
          emptyMessage: 'No pending chat requests',
          renderItem: (item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-[#351E10] truncate" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.visitor_name || 'Unknown Visitor'}
                </p>
                <p className="text-xs text-gray-600 mt-1 truncate" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {item.visitor_email}
                </p>
                <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {getPurposeLabel(item.inquiry_purpose)}
                  {item.purpose_details && ` • ${item.purpose_details.substring(0, 40)}${item.purpose_details.length > 40 ? '...' : ''}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-4">
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  PENDING
                </span>
                <span className="text-xs text-gray-500" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  {formatTimeAgo(item.created_at)}
                </span>
              </div>
            </div>
          )
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[#2e2b41]">
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 text-red-700">
        <i className="fa-solid fa-exclamation-triangle mr-2"></i>
        Error: {error}
      </div>
    );
  }

  // Calculate notification counts and pending items (only count pending, exclude completed/approved)
  const pendingBookings = (stats.recentBookings || []).filter(b => 
    b.status === 'pending'
  ).length;
  
  // Count all donations that are NOT complete
  const pendingDonations = (stats.recentDonations || []).filter(d => 
    d.processing_stage !== 'complete'
  ).length;

  // Count pending chat requests
  const pendingChatRequests = stats.pendingChatRequests || 0;

  const notifications = [
    {
      id: 'bookings',
      title: 'Recent Bookings',
      count: pendingBookings, // Show only pending count
      pendingCount: pendingBookings,
      icon: 'fa-calendar-check',
      color: 'from-[#E5B80B] to-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-white to-yellow-50',
      textColor: 'text-[#351E10]'
    },
    {
      id: 'donations',
      title: 'Recent Donations',
      count: pendingDonations, // Show only pending (incomplete) count
      pendingCount: pendingDonations,
      icon: 'fa-hand-holding-heart',
      color: 'from-[#E5B80B] to-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-white to-yellow-50',
      textColor: 'text-[#351E10]'
    },
    {
      id: 'events',
      title: 'Coming Events',
      count: (stats.recentActivities || []).filter(a => a.type === 'event').length,
      pendingCount: 0, // Events don't have pending status
      icon: 'fa-calendar-week',
      color: 'from-[#351E10] to-[#2A1A0D]',
      bgColor: 'bg-gradient-to-br from-white to-gray-50',
      textColor: 'text-[#E5B80B]'
    },
    {
      id: 'meetings',
      title: 'Scheduled Meetings',
      count: stats.scheduledMeetings?.length || 0,
      pendingCount: 0, // Meetings are already scheduled
      icon: 'fa-calendar-check',
      color: 'from-[#351E10] to-[#2A1A0D]',
      bgColor: 'bg-gradient-to-br from-white to-gray-50',
      textColor: 'text-[#E5B80B]'
    },
    {
      id: 'chat',
      title: 'Chat Requests',
      count: pendingChatRequests, // Show only pending count
      pendingCount: pendingChatRequests,
      icon: 'fa-comments',
      color: 'from-[#E5B80B] to-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-white to-yellow-50',
      textColor: 'text-[#351E10]'
    }
  ];

  const totalNotifications = notifications.reduce((sum, notif) => sum + notif.count, 0);
  const notificationData = getNotificationData();

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 font-telegraf text-[#351E10]">
              <i className="fa-solid fa-bell mr-3 text-[#E5B80B]"></i>
              Notifications Dashboard
            </h1>
            <p className="text-sm md:text-base font-lora text-[#351E10]">Summary of all system notifications and activities</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm font-telegraf text-[#351E10]">Total Notifications</p>
            <p className="text-xl sm:text-2xl font-bold font-telegraf text-[#E5B80B]">
              {totalNotifications}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {notifications.map((notif) => (
          <button
            key={notif.id}
            onClick={() => handleNotificationClick(notif.id)}
            className={`${notif.bgColor} rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left relative`}
          >
            {/* Notification Badge */}
            {notif.pendingCount > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg z-10 animate-pulse">
                {notif.pendingCount > 9 ? '9+' : notif.pendingCount}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-gray-600 font-semibold text-xs sm:text-sm uppercase tracking-wide truncate font-telegraf mb-2">
                  {notif.title}
                </h2>
                <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${notif.textColor} font-telegraf`}>
                  {notif.count}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-telegraf">
                  {notif.count === 1 ? 'pending item' : 'pending items'}
                </p>
              </div>
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r ${notif.color} flex items-center justify-center flex-shrink-0 ml-3 shadow-lg relative`}>
                <i className={`fa-solid ${notif.icon} text-white text-lg sm:text-xl md:text-2xl`}></i>
                {/* Badge on icon if pending */}
                {notif.pendingCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white">
                    {notif.pendingCount > 9 ? '9+' : notif.pendingCount}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-telegraf flex items-center">
                <i className="fa-solid fa-arrow-right mr-2"></i>
                Click to view details
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && notificationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] text-white p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className={`fa-solid ${notificationData.icon} text-white text-lg`}></i>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-telegraf">{notificationData.title}</h2>
                  <p className="text-sm text-white/90 font-telegraf">
                    {notificationData.items.length} {notificationData.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <i className="fa-solid fa-times text-white text-xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {notificationData.items.length > 0 ? (
                <div className="space-y-3">
                  {notificationData.items.map((item, index) => notificationData.renderItem(item, index))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className={`fa-solid ${notificationData.icon} text-4xl sm:text-5xl text-gray-300 mb-4`}></i>
                  <p className="text-gray-500 text-base sm:text-lg font-telegraf">{notificationData.emptyMessage}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  if (selectedNotification === 'bookings') setActiveTab('Schedule');
                  else if (selectedNotification === 'donations' || selectedNotification === 'meetings') setActiveTab('Donation');
                  else if (selectedNotification === 'events') setActiveTab('Event');
                  else if (selectedNotification === 'chat') setActiveTab('Chatbox');
                  setShowDetailModal(false);
                }}
                className="bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8B6B21] text-white px-6 py-2 rounded-lg font-medium transition-all font-telegraf"
              >
                View All in Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
