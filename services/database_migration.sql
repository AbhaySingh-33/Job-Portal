-- Database migration for enhanced application tracking
-- Add status_updated_at and notes columns to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create application_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS application_status_history (
    history_id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_application_status_history_app_id ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_application_status_history_changed_at ON application_status_history(changed_at);

-- Insert initial status history for existing applications
INSERT INTO application_status_history (application_id, status, changed_at, notes)
SELECT 
    application_id, 
    status, 
    applied_at,
    'Initial application submission'
FROM applications 
WHERE application_id NOT IN (
    SELECT DISTINCT application_id FROM application_status_history
);

-- Update trigger to automatically log status changes
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO application_status_history (application_id, status, notes)
        VALUES (NEW.application_id, NEW.status, 'Status updated by recruiter');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS application_status_change_trigger ON applications;
CREATE TRIGGER application_status_change_trigger
    AFTER UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION log_application_status_change();