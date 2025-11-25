# Destockify Deployment Guide

This guide covers deploying the Destockify API and frontend to Google Cloud Run.

## Prerequisites

1. **Google Cloud CLI** installed and authenticated
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

2. **GCP Project** with billing enabled (already set up: `destockify`)
3. **Cloud SQL Database** (already set up: `destockify-db`)

## Database Status

✅ **Your database is already set up!**

- **Project:** `destockify`
- **Instance:** `destockify-db`
- **Database:** `destockify_prod`
- **User:** `destockify_user`
- **Connection Name:** `destockify:us-central1:destockify-db`
- **Public IP:** `34.29.108.164`

## How to Access Your Database

### Option 1: Via Cloud SQL Proxy (Recommended for Local Development)

```bash
# Start Cloud SQL Proxy (in a separate terminal)
cloud-sql-proxy destockify:us-central1:destockify-db --port 5433

# Then connect using any PostgreSQL client:
# - psql: psql "postgresql://destockify_user:PASSWORD@127.0.0.1:5433/destockify_prod"
# - Prisma Studio: npm run prisma:studio
# - Your application: Already configured in .env.local
```

### Option 2: Via Public IP (Direct Connection)

```bash
# Get your current IP
MY_IP=$(curl -s https://api.ipify.org)

# Add your IP to authorized networks
gcloud sql instances patch destockify-db \
  --authorized-networks=$MY_IP/32

# Connect directly
psql "postgresql://destockify_user:PASSWORD@34.29.108.164:5432/destockify_prod"
```

### Option 3: Via Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **SQL** → **destockify-db**
3. Click **"Connect using Cloud Shell"** or use the web-based SQL editor

## Pre-Deployment Setup

### Step 1: Store Secrets in Secret Manager

Before deploying, store sensitive values in Google Secret Manager:

```bash
cd api
export PROJECT_ID="destockify"

# Read values from .env.prod (you'll need to fill these in)
DB_PASSWORD="26OIEhNLgrJvwz40TASryE1rg"  # From setup script
DATABASE_URL="postgresql://destockify_user:${DB_PASSWORD}@localhost:5432/destockify_prod?host=/cloudsql/destockify:us-central1:destockify-db&schema=public"

# Create secrets
echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=-
echo -n "your-production-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "your-production-jwt-refresh-secret" | gcloud secrets create JWT_REFRESH_SECRET --data-file=-
echo -n "destockify" | gcloud secrets create GCS_PROJECT_ID --data-file=-
echo -n "destockify-media-prod" | gcloud secrets create GCS_BUCKET_NAME --data-file=-

# Grant Cloud Run service account access
COMPUTE_SA=$(gcloud iam service-accounts list --filter="displayName:Compute Engine default service account" --format="value(email)")

gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding JWT_REFRESH_SECRET \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding GCS_PROJECT_ID \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding GCS_BUCKET_NAME \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 2: Grant Cloud SQL Access

Ensure the Cloud Run service account can connect to Cloud SQL:

```bash
COMPUTE_SA=$(gcloud iam service-accounts list --filter="displayName:Compute Engine default service account" --format="value(email)")

gcloud projects add-iam-policy-binding destockify \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/cloudsql.client"
```

## Deployment

### Quick Deploy (Automated)

```bash
cd destockify
./api/deploy-all.sh
```

This script will:
1. Deploy the backend API to Cloud Run
2. Deploy the frontend to Cloud Run
3. Update CORS settings
4. Display the deployed URLs

### Manual Deployment

#### Deploy Backend API

```bash
cd api

# Deploy backend with wildcard CORS initially (will be updated after frontend deployment)
gcloud run deploy destockify-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars NODE_ENV=production,GCP_PROJECT_ID=destockify,CORS_ORIGINS="*" \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,JWT_REFRESH_SECRET=JWT_REFRESH_SECRET:latest,GCS_PROJECT_ID=GCS_PROJECT_ID:latest,GCS_BUCKET_NAME=GCS_BUCKET_NAME:latest \
  --add-cloudsql-instances destockify:us-central1:destockify-db

# Get backend URL
API_URL=$(gcloud run services describe destockify-api --region us-central1 --format 'value(status.url)')
echo "Backend API URL: $API_URL"
```

#### Deploy Frontend

```bash
cd ../web-frontend

gcloud run deploy destockify-frontend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5 \
  --min-instances 0 \
  --set-env-vars NODE_ENV=production,NEXT_PUBLIC_API_URL=$API_URL/api

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe destockify-frontend --region us-central1 --format 'value(status.url)')
echo "Frontend URL: $FRONTEND_URL"
```

#### Update Backend CORS

After deploying the frontend, update the backend CORS configuration to allow requests from the frontend:

```bash
cd ../api

# Update CORS_ORIGINS to include frontend URL and localhost for development
gcloud run services update destockify-api \
  --region us-central1 \
  --update-env-vars "CORS_ORIGINS=${FRONTEND_URL},http://localhost:3000"

echo "✅ CORS updated successfully"
```

## Post-Deployment: Run Migrations

After deployment, run production migrations:

```bash
cd api

# Option A: Via Cloud SQL Proxy (local)
# Start proxy in separate terminal:
# cloud-sql-proxy destockify:us-central1:destockify-db --port 5433

# Then run migrations:
./migrate-and-seed.sh

# Option B: Via Cloud Run Job (recommended for production)
gcloud run jobs create destockify-migrate \
  --image=gcr.io/destockify/destockify-api \
  --command="npm,run,prisma:migrate" \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest \
  --add-cloudsql-instances=destockify:us-central1:destockify-db \
  --region us-central1

# Execute the job
gcloud run jobs execute destockify-migrate --region us-central1
```

## Verify Deployment

1. **Check Backend Health:**
   ```bash
   curl $API_URL/api/health
   ```

2. **Check Frontend:**
   Open `$FRONTEND_URL` in your browser

3. **Check Logs:**
   ```bash
   gcloud run logs read destockify-api --region us-central1 --limit 50
   gcloud run logs read destockify-frontend --region us-central1 --limit 50
   ```

## Troubleshooting

### Database Connection Issues

If the API can't connect to the database:

1. **Verify Cloud SQL connection:**
   ```bash
   gcloud run services describe destockify-api --region us-central1 \
     --format="value(spec.template.spec.containers[0].env)"
   ```

2. **Check service account permissions:**
   ```bash
   gcloud projects get-iam-policy destockify \
     --flatten="bindings[].members" \
     --filter="bindings.members:*compute*"
   ```

3. **Verify DATABASE_URL secret:**
   ```bash
   gcloud secrets versions access latest --secret="DATABASE_URL"
   ```

### Build Failures

If deployment fails during build:

1. **Test build locally:**
   ```bash
   cd api
   npm run build
   ```

2. **Check Cloud Build logs:**
   ```bash
   gcloud builds list --limit=5
   ```

### CORS Issues

If you're experiencing CORS errors (e.g., "No 'Access-Control-Allow-Origin' header is present"):

1. **Verify CORS_ORIGINS is set:**
   ```bash
   gcloud run services describe destockify-api --region us-central1 \
     --format="value(spec.template.spec.containers[0].env)" | grep CORS_ORIGINS
   ```

2. **Check current CORS configuration:**
   ```bash
   gcloud run services describe destockify-api --region us-central1 \
     --format="get(spec.template.spec.containers[0].env)"
   ```

3. **Update CORS_ORIGINS manually:**
   ```bash
   # Get frontend URL
   FRONTEND_URL=$(gcloud run services describe destockify-frontend --region us-central1 --format 'value(status.url)')
   
   # Update CORS to include frontend URL
   gcloud run services update destockify-api \
     --region us-central1 \
     --update-env-vars "CORS_ORIGINS=${FRONTEND_URL},http://localhost:3000"
   ```

4. **For development, you can temporarily use wildcard:**
   ```bash
   gcloud run services update destockify-api \
     --region us-central1 \
     --update-env-vars "CORS_ORIGINS=*"
   ```
   ⚠️ **Warning:** Only use wildcard (`*`) for development. In production, always specify exact origins.

5. **Check API logs for CORS errors:**
   ```bash
   gcloud run logs read destockify-api --region us-central1 --limit 50 | grep -i cors
   ```

## Next Steps

- Set up custom domain (optional)
- Configure Cloud Storage bucket for media uploads
- Set up monitoring and alerts
- Configure backup schedules



