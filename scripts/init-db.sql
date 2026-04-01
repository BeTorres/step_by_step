-- Initialize Predictus Database
-- This script runs automatically when the container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Database is already created by POSTGRES_DB env var
-- This file is just for additional initialization if needed

-- Verify connection
SELECT 'Database initialized successfully' as status;
