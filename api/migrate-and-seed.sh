#!/bin/bash

# Script to migrate and seed the Destockify database
# This script uses Cloud SQL Proxy for secure connection to Cloud SQL
# Can be used for both development and production databases

set -e

# Configuration - can be overridden by environment variables
PROJECT_ID="${GCP_PROJECT_ID:-destockify}"
INSTANCE_NAME="${CLOUD_SQL_INSTANCE_NAME:-destockify-db}"
DATABASE_NAME="${DB_NAME:-destockify_prod}"
DB_USER="${DB_USER:-destockify_user}"
DB_PASSWORD="${DB_PASSWORD:-change-me}"

# Check if password is still default
if [ "$DB_PASSWORD" = "change-me" ]; then
  echo "⚠️  WARNING: Using default password. Set DB_PASSWORD environment variable or update this script."
  echo ""
  read -p "Enter database password (or press Enter to use 'change-me'): " INPUT_PASSWORD
  if [ -n "$INPUT_PASSWORD" ]; then
    DB_PASSWORD="$INPUT_PASSWORD"
  fi
fi

echo "🚀 Destockify Database Migration and Seed"
echo "Project: $PROJECT_ID"
echo "Instance: $INSTANCE_NAME"
echo "Database: $DATABASE_NAME"
echo "User: $DB_USER"
echo ""

# Set the project
gcloud config set project "$PROJECT_ID" > /dev/null 2>&1 || true

echo "Step 1: Getting database connection details..."
CONNECTION_NAME=$(gcloud sql instances describe "$INSTANCE_NAME" --format="value(connectionName)" 2>/dev/null || echo "")

if [ -z "$CONNECTION_NAME" ]; then
  echo "❌ Error: Could not find Cloud SQL instance '$INSTANCE_NAME' in project '$PROJECT_ID'"
  echo "   Make sure the instance exists and you have proper permissions."
  exit 1
fi

echo "Connection Name: $CONNECTION_NAME"
echo ""
echo "⚠️  IMPORTANT: You need to have Cloud SQL Proxy running in another terminal."
echo "   Run this command in a separate terminal window:"
echo "   cloud-sql-proxy $CONNECTION_NAME"
echo ""
echo "   The proxy should be listening on localhost:5432"
echo ""

# Check if port 5432 is accessible
if ! nc -z 127.0.0.1 5432 2>/dev/null; then
  echo "❌ Error: Cannot connect to localhost:5432"
  echo "   Please start Cloud SQL Proxy first:"
  echo "   cloud-sql-proxy $CONNECTION_NAME"
  exit 1
fi

echo "✅ Cloud SQL Proxy connection detected"
echo ""

# Use localhost since Cloud SQL Proxy will forward to Cloud SQL
DATABASE_URL="postgresql://$DB_USER:${DB_PASSWORD}@127.0.0.1:5432/${DATABASE_NAME}?schema=public"

export DATABASE_URL

echo "Step 2: Running Prisma migrations..."
npm run prisma:migrate || {
  echo "❌ Migration failed. Check the error above."
  exit 1
}

echo ""
echo "Step 3: Seeding database with reference data..."
npm run db:seed || {
  echo "⚠️  Seeding failed or skipped. This is okay if the database is already seeded."
}

echo ""
echo "✅ Destockify database migration and seed complete!"
echo ""
echo "You can now start the development server with: npm run dev"

