-- Create live chat tables for visitor-staff communication
USE museosmart;

-- Table for chat requests from visitors
CREATE TABLE IF NOT EXISTS chat_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_name VARCHAR(255) NOT NULL,
    visitor_email VARCHAR(255) NOT NULL,
    inquiry_purpose ENUM('schedule_visit', 'donation', 'event_participation', 'other') NOT NULL,
    purpose_details TEXT,
    status ENUM('pending', 'accepted', 'in_progress', 'closed', 'cancelled') DEFAULT 'pending',
    assigned_staff_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (assigned_staff_id) REFERENCES system_user(user_ID) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_assigned_staff (assigned_staff_id),
    INDEX idx_created_at (created_at)
);

-- Table for chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_request_id INT NOT NULL,
    sender_type ENUM('visitor', 'staff') NOT NULL,
    sender_id INT NULL, -- NULL for visitor, user_ID for staff
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_request_id) REFERENCES chat_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES system_user(user_ID) ON DELETE SET NULL,
    INDEX idx_chat_request (chat_request_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
);

