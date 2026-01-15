#!/bin/bash

echo "🐳 Starting Docker containers..."

# Start containers
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if containers are running
docker-compose ps

echo "✅ Docker containers started successfully!"
echo "📊 PostgreSQL: localhost:5432"
echo "📦 Redis: localhost:6379"
