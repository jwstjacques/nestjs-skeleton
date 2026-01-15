#!/bin/bash

source .env

if [ -z "$1" ]; then
    echo "Usage: ./scripts/db-restore.sh <backup-file>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  This will restore the database from backup!"
read -p "Are you sure? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if file is compressed
    if [[ $BACKUP_FILE == *.gz ]]; then
        echo "Decompressing backup..."
        gunzip -k $BACKUP_FILE
        BACKUP_FILE="${BACKUP_FILE%.gz}"
    fi

    echo "Restoring database..."
    cat $BACKUP_FILE | docker exec -i nestjs-task-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB

    if [ $? -eq 0 ]; then
        echo "✅ Database restored successfully!"
    else
        echo "❌ Restore failed!"
        exit 1
    fi
else
    echo "❌ Restore cancelled."
fi
