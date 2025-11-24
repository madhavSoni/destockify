#!/bin/bash

# Script to set up Google Cloud SQL database for Destockify
# This script creates the Cloud SQL instance, database, and user

set -e

# Configuration - Update these values for your project
PROJECT_ID="${GCP_PROJECT_ID:-destockify}"
INSTANCE_NAME="${CLOUD_SQL_INSTANCE_NAME:-destockify-db}"
DATABASE_NAME="${DB_NAME:-destockify_prod}"
DB_USER="${DB_USER:-destockify_user}"
REGION="${DB_REGION:-us-central1}"
TIER="${DB_TIER:-db-f1-micro}"  # Use db-f1-micro for free tier, or db-custom-1-3840 for production

echo "🚀 Setting up Google Cloud SQL for Destockify"
echo "Project ID: $PROJECT_ID"
echo "Instance Name: $INSTANCE_NAME"
echo "Database Name: $DATABASE_NAME"
echo "Region: $REGION"
echo ""

# Check if project exists
echo "🔍 Checking if project exists..."
if ! gcloud projects describe "$PROJECT_ID" &>/dev/null; then
  echo "❌ Project '$PROJECT_ID' does not exist or you don't have access to it."
  echo ""
  echo "You have two options:"
  echo "1. Create a new project:"
  echo "   gcloud projects create $PROJECT_ID --name='Destockify Production'"
  echo "   gcloud billing projects link $PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT_ID"
  echo ""
  echo "2. Use an existing project by setting GCP_PROJECT_ID:"
  echo "   export GCP_PROJECT_ID=your-existing-project-id"
  echo "   ./setup-cloud-sql.sh"
  echo ""
  echo "3. List your existing projects:"
  echo "   gcloud projects list"
  echo ""
  read -p "Would you like to create the project '$PROJECT_ID' now? (y/N): " CREATE_PROJECT
  if [[ "$CREATE_PROJECT" =~ ^[Yy]$ ]]; then
    echo "Creating project..."
    gcloud projects create "$PROJECT_ID" --name="Destockify Production" || {
      echo "❌ Failed to create project. It may already exist or the name is taken."
      echo "   Try using a different project ID or use an existing project."
      exit 1
    }
    echo "✅ Project created. You'll need to link a billing account:"
    echo "   gcloud billing projects link $PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT_ID"
    echo ""
    read -p "Press Enter after linking billing account to continue..."
  else
    echo "Exiting. Please create the project or use an existing one."
    exit 1
  fi
fi

# Set the project
echo "Setting active project..."
gcloud config set project "$PROJECT_ID" || {
  echo "❌ Failed to set project. Check your permissions."
  exit 1
}

# Enable required APIs
echo "📦 Enabling required Google Cloud APIs..."
gcloud services enable sqladmin.googleapis.com \
  run.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com || {
  echo "❌ Failed to enable APIs. Check your permissions and billing status."
  exit 1
}

echo ""
echo "🗄️  Creating Cloud SQL instance (this may take several minutes)..."
# Check if instance already exists
if gcloud sql instances describe "$INSTANCE_NAME" &>/dev/null; then
  echo "Instance '$INSTANCE_NAME' already exists, skipping creation..."
else
  gcloud sql instances create "$INSTANCE_NAME" \
    --database-version=POSTGRES_15 \
    --tier="$TIER" \
    --region="$REGION" \
    --storage-type=SSD \
    --storage-size=10GB \
    --storage-auto-increase \
    --backup \
    --backup-start-time=03:00 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04 || {
    echo "❌ Failed to create instance. Check the error above."
    exit 1
  }
fi

echo ""
echo "📊 Creating database..."
gcloud sql databases create "$DATABASE_NAME" \
  --instance="$INSTANCE_NAME" \
  || echo "Database may already exist, continuing..."

echo ""
echo "👤 Creating database user..."
# Generate a secure random password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "Generated password: $DB_PASSWORD"
echo "⚠️  IMPORTANT: Save this password securely!"

gcloud sql users create "$DB_USER" \
  --instance="$INSTANCE_NAME" \
  --password="$DB_PASSWORD" \
  || echo "User may already exist. If you need to reset the password, run:"
echo "   gcloud sql users set-password $DB_USER --instance=$INSTANCE_NAME --password=NEW_PASSWORD"

echo ""
echo "🔗 Getting connection details..."
CONNECTION_NAME=$(gcloud sql instances describe "$INSTANCE_NAME" --format="value(connectionName)")
DB_IP=$(gcloud sql instances describe "$INSTANCE_NAME" --format="value(ipAddresses[0].ipAddress)")

echo ""
echo "✅ Cloud SQL setup complete!"
echo ""
echo "Connection Details:"
echo "  Connection Name: $CONNECTION_NAME"
echo "  Public IP: $DB_IP"
echo "  Database: $DATABASE_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "📝 Update your .env.prod file with:"
echo "  DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DATABASE_NAME?host=/cloudsql/$CONNECTION_NAME&schema=public"
echo ""
echo "For local development, use Cloud SQL Proxy:"
echo "  cloud-sql-proxy $CONNECTION_NAME"
echo ""
echo "Then connect via:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@127.0.0.1:5432/$DATABASE_NAME?schema=public"

