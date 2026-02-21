-- Create archive_files table to support multiple files per archive
CREATE TABLE IF NOT EXISTS archive_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    archive_id INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (archive_id) REFERENCES archives(id) ON DELETE CASCADE,
    INDEX idx_archive_files_archive_id (archive_id)
);

-- Note: We keep file_url in archives table for backward compatibility
-- but new uploads should use archive_files table

