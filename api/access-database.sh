#!/bin/bash
# Helper script to access Destockify database

PROJECT_ID="destockify"
INSTANCE_NAME="destockify-db"
DB_NAME="destockify_prod"
DB_USER="destockify_user"
CONNECTION_NAME="destockify:us-central1:destockify-db"

echo "🔍 Destockify Database Access"
echo ""
echo "Connection Details:"
echo "  Project: $PROJECT_ID"
echo "  Instance: $INSTANCE_NAME"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Connection Name: $CONNECTION_NAME"
echo ""

echo "📋 Access Methods:"
echo ""
echo "1. Via Cloud SQL Proxy (Recommended):"
echo "   cloud-sql-proxy $CONNECTION_NAME --port 5433"
echo "   Then connect: psql \"postgresql://$DB_USER:PASSWORD@127.0.0.1:5433/$DB_NAME\""
echo ""
echo "2. Via Prisma Studio:"
echo "   npm run prisma:studio"
echo "   (Make sure Cloud SQL Proxy is running on port 5433)"
echo ""
echo "3. Via Google Cloud Console:"
echo "   https://console.cloud.google.com/sql/instances/$INSTANCE_NAME/overview?project=$PROJECT_ID"
echo ""
echo "4. Via Public IP (requires authorized network):"
echo "   psql \"postgresql://$DB_USER:PASSWORD@34.29.108.164:5432/$DB_NAME\""
echo ""

# Check if Cloud SQL Proxy is running
if lsof -i :5433 > /dev/null 2>&1; then
  echo "✅ Cloud SQL Proxy is running on port 5433"
else
  echo "⚠️  Cloud SQL Proxy is NOT running"
  echo "   Start it with: cloud-sql-proxy $CONNECTION_NAME --port 5433"
fi
