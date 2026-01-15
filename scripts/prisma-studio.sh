#!/bin/bash
# Prisma Studio - Database GUI (non-production only)
#
# Opens Prisma Studio for visual database management.
# Blocked in production environments for safety.

set -e

# Check for production environment
if [[ "$NODE_ENV" == "production" ]]; then
  echo "❌ Error: Prisma Studio is disabled in production environments"
  echo ""
  echo "Prisma Studio provides direct database access and should not"
  echo "be used in production for security reasons."
  echo ""
  echo "For production database access, use:"
  echo "  - Read replicas with proper access controls"
  echo "  - Database admin tools with audit logging"
  echo "  - ./scripts/db-connect.sh for CLI access"
  exit 1
fi

# Additional safety check for production-like DATABASE_URL
if [[ "$DATABASE_URL" == *"prod"* ]] || [[ "$DATABASE_URL" == *"production"* ]]; then
  echo "⚠️  Warning: DATABASE_URL appears to point to a production database"
  echo ""
  read -p "Are you sure you want to continue? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
fi

echo "🔍 Starting Prisma Studio..."
echo "   Environment: ${NODE_ENV:-development}"
echo ""

npx prisma studio
