#!/bin/bash

# Script to migrate and seed the Destockify production database
# This script uses Cloud SQL Proxy for secure connection

set -e

PROJECT_ID="destockify-prod"
DB_PASSWORD="change-me"
INSTANCE_NAME="destockify-db"
DATABASE_NAME="destockify_prod"
DB_USER="destockify_user"

echo "Step 1: Getting database connection details..."
CONNECTION_NAME=$(gcloud sql instances describe "$INSTANCE_NAME" --format="value(connectionName)")

echo "Connection Name: $CONNECTION_NAME"
echo ""
echo "⚠️  IMPORTANT: You need to have Cloud SQL Proxy running in another terminal."
echo "   Run this command in a separate terminal window:"
echo "   cloud-sql-proxy $CONNECTION_NAME"
echo ""
read -p "Press Enter once Cloud SQL Proxy is running on port 5432..."

# Use localhost since Cloud SQL Proxy will forward to production
DATABASE_URL="postgresql://$DB_USER:${DB_PASSWORD}@127.0.0.1:5432/${DATABASE_NAME}?schema=public"

export DATABASE_URL

echo ""
echo "Step 2: Running Prisma migrations..."
npm run prisma:migrate

echo ""
echo "Step 3: Seeding database with reference data..."
npm run db:seed

echo ""
echo "✅ Destockify database migration and seed complete!"

