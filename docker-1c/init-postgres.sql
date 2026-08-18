-- 1C Enterprise PostgreSQL Initialization Script

-- Create user and database for 1C if not created
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        CREATE ROLE postgres WITH SUPERUSER LOGIN PASSWORD 'postgres';
    END IF;
END
$$;

-- Create default database for 1C infobase
SELECT 'CREATE DATABASE radcor_1c OWNER postgres LC_COLLATE = ''ru_RU.UTF-8'' LC_CTYPE = ''ru_RU.UTF-8'''
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'radcor_1c')\gexec

-- Tuning parameters for 1C:Enterprise
ALTER SYSTEM SET standard_conforming_strings = 'off';
ALTER SYSTEM SET escape_string_warning = 'off';
ALTER SYSTEM SET max_locks_per_transaction = 256;
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET row_security = 'off';
