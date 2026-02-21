-- Add archive_id column to images table to support archive files
ALTER TABLE images ADD COLUMN archive_id INT NULL AFTER cultural_object_id;

-- Add foreign key constraint
ALTER TABLE images ADD CONSTRAINT fk_images_archive_id FOREIGN KEY (archive_id) REFERENCES archives(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_images_archive_id ON images(archive_id);

