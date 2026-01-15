#!/bin/bash

source .env

echo "Connecting to PostgreSQL database..."
docker exec -it nestjs-task-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
