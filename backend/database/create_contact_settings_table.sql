-- Create contact_settings table for managing museum contact information
CREATE TABLE IF NOT EXISTS contact_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(100),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    operating_hours VARCHAR(255),
    email_response_time VARCHAR(100),
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create social_media_links table for managing social media connections
CREATE TABLE IF NOT EXISTS social_media_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default contact settings
INSERT INTO contact_settings (phone, email, address_line1, address_line2, operating_hours, email_response_time)
VALUES (
    '+63 88 123 4567',
    'cdocitymuseum@cagayandeoro.gov.ph',
    'Gaston Park, Cagayan de Oro City',
    'Misamis Oriental, Philippines',
    'Mon-Fri: 8:00 AM - 5:00 PM',
    'We''ll respond within 24 hours'
) ON DUPLICATE KEY UPDATE phone = phone;

-- Insert default social media links
INSERT INTO social_media_links (name, icon, url, display_order, is_active)
VALUES 
    ('Facebook', 'fa-brands fa-facebook', 'https://www.facebook.com/CDOCityMuseumHeritageStudiesCenter/', 1, TRUE),
    ('Email', 'fa-solid fa-envelope', 'https://mail.google.com/mail/?view=cm&to=cdocitymuseum@cagayandeoro.gov.ph', 2, TRUE)
ON DUPLICATE KEY UPDATE name = name;

