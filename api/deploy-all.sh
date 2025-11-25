#!/bin/bash
# Complete deployment script for Destockify
# Run this after: gcloud auth login

set -e

PROJECT_ID="${GCP_PROJECT_ID:-destockify}"
REGION="us-central1"
CONNECTION_NAME="destockify:us-central1:destockify-db"

echo "🚀 Deploying Destockify to Google Cloud Platform"
echo "Project: $PROJECT_ID"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Step 1: Deploy Backend API
echo "📦 Deploying backend API..."
cd "$(dirname "$0")"

# Deploy backend initially with wildcard CORS (will be updated after frontend deployment)
# This allows the backend to accept requests from any origin initially
gcloud run deploy destockify-api \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars NODE_ENV=production,GCP_PROJECT_ID=${PROJECT_ID},CORS_ORIGINS="*" \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,JWT_REFRESH_SECRET=JWT_REFRESH_SECRET:latest,GCS_PROJECT_ID=GCS_PROJECT_ID:latest,GCS_BUCKET_NAME=GCS_BUCKET_NAME:latest \
  --add-cloudsql-instances "${CONNECTION_NAME}"

API_URL=$(gcloud run services describe destockify-api --region $REGION --format 'value(status.url)')
echo "✅ Backend deployed: $API_URL"
echo ""

# Step 2: Deploy Frontend
echo "📦 Deploying frontend..."
cd ../web-frontend

gcloud run deploy destockify-frontend \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5 \
  --min-instances 0 \
  --set-env-vars NODE_ENV=production,NEXT_PUBLIC_API_URL=$API_URL/api

FRONTEND_URL=$(gcloud run services describe destockify-frontend --region $REGION --format 'value(status.url)')
echo "✅ Frontend deployed: $FRONTEND_URL"
echo ""

# Step 3: Update Backend CORS
echo "🔧 Updating backend CORS..."
cd ../api

# Get frontend URL (already retrieved above, but get it again to be safe)
FRONTEND_CUSTOM=$(gcloud run services describe destockify-frontend --region $REGION --format 'value(status.url)')

# Build CORS origins list - include frontend URL and localhost for development
CORS_ORIGINS="${FRONTEND_CUSTOM},http://localhost:3000"

# Update CORS_ORIGINS using ^|^ delimiter with --set-env-vars
# The ^|^ tells gcloud to use | as delimiter for KEY=VALUE pairs instead of comma
# This allows commas within values (like CORS_ORIGINS) to be preserved
# Format: --set-env-vars "^|^KEY1=VALUE1|KEY2=VALUE2|KEY3=VALUE3"
gcloud run services update destockify-api \
  --region $REGION \
  --set-env-vars "^|^NODE_ENV=production|GCP_PROJECT_ID=${PROJECT_ID}|CORS_ORIGINS=${CORS_ORIGINS}"

echo "✅ CORS updated successfully"
echo "   Allowed origins: ${CORS_ORIGINS}"

echo ""
echo "✅ Deployment complete!"
echo "📱 Frontend: $FRONTEND_URL"
echo "🔌 Backend: $API_URL"
echo ""
echo "⚠️  Don't forget to run database migrations!"
echo "   See DEPLOYMENT.md for migration instructions"

