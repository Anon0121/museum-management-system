-- Create table for chat availability settings
USE museosmart;

CREATE TABLE IF NOT EXISTS chat_availability_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_hour INT NOT NULL DEFAULT 8, -- Hour in 24-hour format (0-23)
    end_hour INT NOT NULL DEFAULT 17, -- Hour in 24-hour format (0-23)
    enabled BOOLEAN DEFAULT TRUE, -- Whether availability check is enabled
    timezone VARCHAR(50) DEFAULT 'Asia/Manila',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_settings (id)
);

-- Insert default settings (8 AM - 5 PM)
INSERT INTO chat_availability_settings (start_hour, end_hour, enabled, timezone)
VALUES (8, 17, TRUE, 'Asia/Manila')
ON DUPLICATE KEY UPDATE start_hour = 8, end_hour = 17;

