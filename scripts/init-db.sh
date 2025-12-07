#!/bin/bash
set -e

# This script runs when the PostgreSQL container is first created

echo "Initializing database..."

# Create additional databases if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Create test database
    CREATE DATABASE ${POSTGRES_DB}_test;
    
    GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB}_test TO $POSTGRES_USER;
EOSQL

echo "Database initialization complete."
