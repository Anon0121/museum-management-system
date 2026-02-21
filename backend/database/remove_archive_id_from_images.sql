-- Remove archive_id column from images table since we're using archive_files table instead
ALTER TABLE images DROP FOREIGN KEY fk_images_archive_id;
DROP INDEX idx_images_archive_id ON images;
ALTER TABLE images DROP COLUMN archive_id;

