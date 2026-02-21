const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper function to get availability settings
const getAvailabilitySettings = async () => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM chat_availability_settings ORDER BY id DESC LIMIT 1'
    );
    if (settings.length > 0) {
      return settings[0];
    }
    // Default settings if none exist
    return { start_hour: 8, end_hour: 17, enabled: true, timezone: 'Asia/Manila' };
  } catch (error) {
    console.error('Error fetching availability settings:', error);
    // Return default if table doesn't exist yet
    return { start_hour: 8, end_hour: 17, enabled: true, timezone: 'Asia/Manila' };
  }
};

// Helper function to check if staff is available (uses custom settings)
const isStaffAvailable = async () => {
  try {
    const settings = await getAvailabilitySettings();
    
    // If availability check is disabled, always available
    if (!settings.enabled) {
      return true;
    }
    
    const now = new Date();
    const hours = now.getHours();
    const startHour = settings.start_hour || 8;
    const endHour = settings.end_hour || 17;
    
    // Check if current hour is within availability range
    return hours >= startHour && hours < endHour;
  } catch (error) {
    console.error('Error checking availability:', error);
    // Fallback to default hours
    const now = new Date();
    const hours = now.getHours();
    return hours >= 8 && hours < 17;
  }
};

// GET /api/live-chat/availability - Check if staff is available
router.get('/availability', async (req, res) => {
  try {
    const settings = await getAvailabilitySettings();
    const available = await isStaffAvailable();
    
    const formatHour = (hour) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      return `${displayHour}:00 ${period}`;
    };
    
    res.json({
      success: true,
      available,
      settings: {
        start_hour: settings.start_hour,
        end_hour: settings.end_hour,
        enabled: settings.enabled,
        start_time: formatHour(settings.start_hour),
        end_time: formatHour(settings.end_hour)
      },
      message: available 
        ? 'Staff is available for live chat' 
        : `Staff is only available from ${formatHour(settings.start_hour)} to ${formatHour(settings.end_hour)}`
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ success: false, message: 'Error checking availability' });
  }
});

// POST /api/live-chat/request - Visitor creates a chat request
router.post('/request', async (req, res) => {
  try {
    const { visitor_name, visitor_email, inquiry_purpose, purpose_details } = req.body;

    // Validate required fields
    if (!visitor_name || !visitor_email || !inquiry_purpose) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and inquiry purpose are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(visitor_email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if staff is available
    const available = await isStaffAvailable();
    if (!available) {
      const settings = await getAvailabilitySettings();
      const formatHour = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:00 ${period}`;
      };
      
      return res.status(400).json({
        success: false,
        message: `Staff is only available from ${formatHour(settings.start_hour)} to ${formatHour(settings.end_hour)}. Please try again during business hours.`,
        available: false
      });
    }

    // Create chat request
    const [result] = await pool.execute(
      `INSERT INTO chat_requests (visitor_name, visitor_email, inquiry_purpose, purpose_details, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [visitor_name, visitor_email, inquiry_purpose, purpose_details || null]
    );

    res.json({
      success: true,
      message: 'Chat request submitted successfully. A staff member will respond shortly.',
      chat_request_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating chat request:', error);
    res.status(500).json({ success: false, message: 'Error creating chat request' });
  }
});

// GET /api/live-chat/requests - Get all chat requests (staff only)
router.get('/requests', async (req, res) => {
  try {
    // Check authentication
    if (!req.session.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const [requests] = await pool.execute(
      `SELECT cr.*, 
              u.firstname as staff_firstname, 
              u.lastname as staff_lastname,
              (SELECT COUNT(*) FROM chat_messages cm WHERE cm.chat_request_id = cr.id AND cm.sender_type = 'visitor' AND cm.is_read = FALSE) as unread_count
       FROM chat_requests cr
       LEFT JOIN system_user u ON cr.assigned_staff_id = u.user_ID
       ORDER BY cr.created_at DESC`
    );

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching chat requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching chat requests' });
  }
});

// GET /api/live-chat/requests/:id - Get specific chat request with messages
router.get('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get chat request
    const [requests] = await pool.execute(
      `SELECT cr.*, 
              u.firstname as staff_firstname, 
              u.lastname as staff_lastname
       FROM chat_requests cr
       LEFT JOIN system_user u ON cr.assigned_staff_id = u.user_ID
       WHERE cr.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Chat request not found' });
    }

    // Get messages
    const [messages] = await pool.execute(
      `SELECT cm.*, 
              u.firstname as staff_firstname, 
              u.lastname as staff_lastname
       FROM chat_messages cm
       LEFT JOIN system_user u ON cm.sender_id = u.user_ID
       WHERE cm.chat_request_id = ?
       ORDER BY cm.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      chat_request: requests[0],
      messages
    });
  } catch (error) {
    console.error('Error fetching chat request:', error);
    res.status(500).json({ success: false, message: 'Error fetching chat request' });
  }
});

// POST /api/live-chat/requests/:id/accept - Staff accepts a chat request
router.post('/requests/:id/accept', async (req, res) => {
  try {
    if (!req.session.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const staffId = req.session.user?.id;
    
    if (!staffId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Check if request exists and is pending
    const [requests] = await pool.execute(
      'SELECT * FROM chat_requests WHERE id = ? AND status = ?',
      [id, 'pending']
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat request not found or already assigned'
      });
    }

    // Assign to staff
    await pool.execute(
      `UPDATE chat_requests 
       SET status = 'in_progress', assigned_staff_id = ?, accepted_at = NOW()
       WHERE id = ?`,
      [staffId, id]
    );

    res.json({
      success: true,
      message: 'Chat request accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting chat request:', error);
    res.status(500).json({ success: false, message: 'Error accepting chat request' });
  }
});

// POST /api/live-chat/requests/:id/close - Close a chat request
router.post('/requests/:id/close', async (req, res) => {
  try {
    if (!req.session.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;

    await pool.execute(
      `UPDATE chat_requests 
       SET status = 'closed', closed_at = NOW()
       WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Chat request closed successfully'
    });
  } catch (error) {
    console.error('Error closing chat request:', error);
    res.status(500).json({ success: false, message: 'Error closing chat request' });
  }
});

// POST /api/live-chat/messages - Send a message
router.post('/messages', async (req, res) => {
  try {
    const { chat_request_id, message, sender_type } = req.body;

    if (!chat_request_id || !message || !sender_type) {
      return res.status(400).json({
        success: false,
        message: 'Chat request ID, message, and sender type are required'
      });
    }

    // For staff, require authentication
    let senderId = null;
    if (sender_type === 'staff') {
      if (!req.session.user?.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      senderId = req.session.user?.id;
    }

    // Insert message
    const [result] = await pool.execute(
      `INSERT INTO chat_messages (chat_request_id, sender_type, sender_id, message)
       VALUES (?, ?, ?, ?)`,
      [chat_request_id, sender_type, senderId, message]
    );

    // If message is from staff, mark visitor messages as read
    if (sender_type === 'staff') {
      await pool.execute(
        `UPDATE chat_messages 
         SET is_read = TRUE 
         WHERE chat_request_id = ? AND sender_type = 'visitor'`,
        [chat_request_id]
      );
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      message_id: result.insertId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});

// GET /api/live-chat/visitor/:email - Get chat requests for a visitor (by email)
router.get('/visitor/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const [requests] = await pool.execute(
      `SELECT cr.*, 
              u.firstname as staff_firstname, 
              u.lastname as staff_lastname
       FROM chat_requests cr
       LEFT JOIN system_user u ON cr.assigned_staff_id = u.user_ID
       WHERE cr.visitor_email = ?
       ORDER BY cr.created_at DESC`,
      [email]
    );

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching visitor chat requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching chat requests' });
  }
});

// GET /api/live-chat/visitor/:email/requests/:id/messages - Get messages for visitor
router.get('/visitor/:email/requests/:id/messages', async (req, res) => {
  try {
    const { email, id } = req.params;

    // Verify the chat request belongs to this visitor
    const [requests] = await pool.execute(
      'SELECT * FROM chat_requests WHERE id = ? AND visitor_email = ?',
      [id, email]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Chat request not found' });
    }

    // Get messages
    const [messages] = await pool.execute(
      `SELECT cm.*, 
              u.firstname as staff_firstname, 
              u.lastname as staff_lastname
       FROM chat_messages cm
       LEFT JOIN system_user u ON cm.sender_id = u.user_ID
       WHERE cm.chat_request_id = ?
       ORDER BY cm.created_at ASC`,
      [id]
    );

    // Mark staff messages as read
    await pool.execute(
      `UPDATE chat_messages 
       SET is_read = TRUE 
       WHERE chat_request_id = ? AND sender_type = 'staff'`,
      [id]
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
});

// GET /api/live-chat/availability/settings - Get availability settings (staff only)
router.get('/availability/settings', async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const settings = await getAvailabilitySettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching availability settings:', error);
    res.status(500).json({ success: false, message: 'Error fetching availability settings' });
  }
});

// PUT /api/live-chat/availability/settings - Update availability settings (staff only)
router.put('/availability/settings', async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { start_hour, end_hour, enabled } = req.body;

    // Validate hours
    if (start_hour !== undefined && (start_hour < 0 || start_hour > 23)) {
      return res.status(400).json({ success: false, message: 'Start hour must be between 0 and 23' });
    }
    if (end_hour !== undefined && (end_hour < 0 || end_hour > 23)) {
      return res.status(400).json({ success: false, message: 'End hour must be between 0 and 23' });
    }
    if (start_hour !== undefined && end_hour !== undefined && start_hour >= end_hour) {
      return res.status(400).json({ success: false, message: 'Start hour must be before end hour' });
    }

    // Check if settings exist
    const [existing] = await pool.execute('SELECT * FROM chat_availability_settings ORDER BY id DESC LIMIT 1');
    
    if (existing.length > 0) {
      // Update existing - use existing values if new ones are undefined
      const updateStartHour = start_hour !== undefined ? start_hour : existing[0].start_hour;
      const updateEndHour = end_hour !== undefined ? end_hour : existing[0].end_hour;
      const updateEnabled = enabled !== undefined ? enabled : existing[0].enabled;
      
      await pool.execute(
        `UPDATE chat_availability_settings 
         SET start_hour = ?,
             end_hour = ?,
             enabled = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [updateStartHour, updateEndHour, updateEnabled ? 1 : 0, existing[0].id]
      );
    } else {
      // Create new
      await pool.execute(
        `INSERT INTO chat_availability_settings (start_hour, end_hour, enabled)
         VALUES (?, ?, ?)`,
        [
          start_hour !== undefined ? start_hour : 8, 
          end_hour !== undefined ? end_hour : 17, 
          enabled !== undefined ? (enabled ? 1 : 0) : 1
        ]
      );
    }

    const updatedSettings = await getAvailabilitySettings();
    res.json({
      success: true,
      message: 'Availability settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating availability settings:', error);
    res.status(500).json({ success: false, message: 'Error updating availability settings' });
  }
});

// POST /api/live-chat/visitor/:email/requests/:id/messages - Visitor sends a message
router.post('/visitor/:email/requests/:id/messages', async (req, res) => {
  try {
    const { email, id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Verify the chat request belongs to this visitor
    const [requests] = await pool.execute(
      'SELECT * FROM chat_requests WHERE id = ? AND visitor_email = ?',
      [id, email]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Chat request not found' });
    }

    // Insert message
    const [result] = await pool.execute(
      `INSERT INTO chat_messages (chat_request_id, sender_type, sender_id, message)
       VALUES (?, 'visitor', NULL, ?)`,
      [id, message]
    );

    res.json({
      success: true,
      message: 'Message sent successfully',
      message_id: result.insertId
    });
  } catch (error) {
    console.error('Error sending visitor message:', error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});

module.exports = router;

