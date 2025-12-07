#!/bin/bash

echo "📊 Prisma Migration Status"
echo "=========================="
npx prisma migrate status

echo ""
echo "📈 Database Statistics"
echo "====================="

# Get counts from database
docker exec nestjs-task-postgres psql -U postgres -d taskdb -c "
SELECT
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM tasks) as tasks,
  (SELECT COUNT(*) FROM tasks WHERE status = 'TODO') as todo_tasks,
  (SELECT COUNT(*) FROM tasks WHERE status = 'IN_PROGRESS') as in_progress_tasks,
  (SELECT COUNT(*) FROM tasks WHERE status = 'COMPLETED') as completed_tasks;
"
