#!/bin/bash

echo "⚠️  This will remove all Docker containers and volumes!"
read -p "Are you sure? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing Docker containers and volumes..."
    docker-compose down -v
    echo "✅ Docker environment reset complete!"
else
    echo "❌ Reset cancelled."
fi
