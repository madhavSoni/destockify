#!/bin/bash
# Quick connection script for database clients

DB_USER="destockify_user"
DB_PASSWORD="26OIEhNLgrJvwz40TASryE1rg"
DB_HOST="34.29.108.164"
DB_PORT="5432"
DB_NAME="destockify_prod"

CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "🔌 Database Connection String:"
echo ""
echo "$CONNECTION_STRING"
echo ""
echo "📋 Connection Details for Database Clients:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "⚠️  Note: Your IP must be in authorized networks"
echo "   If connection fails, run: ./add-my-ip.sh"
echo ""
echo "💡 Recommended: Use Cloud SQL Proxy instead for better security"
echo "   cloud-sql-proxy destockify:us-central1:destockify-db --port 5433"
