-- Initialization script for PostgreSQL
-- This file is automatically executed when the database container starts for the first time

-- Create database if not exists (handled by POSTGRES_DB env var)
-- The database is created automatically by the postgres image

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE school_canteen TO canteen_user;

-- Note: Tables will be created by the application on first run
