#!/bin/bash

echo "⚠️  This will reset the database and delete all data!"
read -p "Are you sure? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Resetting database..."
    npx prisma migrate reset --force

    if [ $? -eq 0 ]; then
        echo "✅ Database reset complete!"
        echo "🌱 Running seed..."
        npm run prisma:seed
    else
        echo "❌ Database reset failed!"
        exit 1
    fi
else
    echo "❌ Reset cancelled."
fi
