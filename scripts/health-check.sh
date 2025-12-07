#!/bin/bash

echo "🏥 Performing health checks..."

# Check PostgreSQL
echo -n "PostgreSQL: "
if docker exec nestjs-task-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# Check Redis
echo -n "Redis: "
if docker exec nestjs-task-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# Check Application (if running)
echo -n "Application: "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Healthy (HTTP 200)"
elif [ "$RESPONSE" = "000" ]; then
    echo "⚠️  Not running"
else
    echo "❌ Unhealthy (HTTP $RESPONSE)"
fi
