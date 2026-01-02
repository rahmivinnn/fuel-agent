-- Update face_biometrics table column name
-- Run this SQL to rename face_image to face_image_url

ALTER TABLE face_biometrics 
RENAME COLUMN face_image TO face_image_url;

-- Verify the change
\d face_biometrics;