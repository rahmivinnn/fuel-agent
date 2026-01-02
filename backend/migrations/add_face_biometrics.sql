-- Migration: Add face_biometrics table
-- Run this SQL to add face biometric storage

CREATE TABLE IF NOT EXISTS face_biometrics (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  fuel_friend_id VARCHAR NOT NULL REFERENCES fuel_friends(id),
  face_descriptor TEXT NOT NULL, -- JSON string of face descriptor array
  face_image TEXT, -- Base64 encoded face image
  confidence DECIMAL(5,4), -- Face detection confidence
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_face_biometrics_fuel_friend_id ON face_biometrics(fuel_friend_id);

-- Add comment
COMMENT ON TABLE face_biometrics IS 'Stores face biometric data for fuel friends authentication';