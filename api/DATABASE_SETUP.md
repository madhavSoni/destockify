# Destockify Database Setup Guide

This guide covers setting up and connecting to the Google Cloud SQL PostgreSQL database for Destockify, both for local development and production deployment.

## Prerequisites

1. **Google Cloud CLI** installed and authenticated
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

2. **Cloud SQL Proxy** installed (for local development)
   ```bash
   # macOS
   brew install cloud-sql-proxy
   
   # Linux
   wget https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64 -O cloud-sql-proxy
   chmod +x cloud-sql-proxy
   sudo mv cloud-sql-proxy /usr/local/bin/
   ```

3. **GCP Project** with billing enabled
4. **Required APIs enabled** (handled by setup script)

## Quick Setup

### Step 0: Choose or Create a GCP Project

Before running the setup script, you need a GCP project. You have two options:

**Option A: Use an existing project**
```bash
# List your existing projects
cd api
./list-gcp-projects.sh

# Set the project ID
export GCP_PROJECT_ID=your-existing-project-id
```

**Option B: Create a new project**
```bash
# Create a new project
gcloud projects create destockify-prod --name="Destockify Production"

# Link billing account (required for Cloud SQL)
gcloud billing projects link destockify-prod --billing-account=YOUR_BILLING_ACCOUNT_ID

# List billing accounts if you don't know yours
gcloud billing accounts list
```

### Option 1: Automated Setup Script

Run the setup script to create the Cloud SQL instance:

```bash
cd api
./setup-cloud-sql.sh
```

The script will:
- Check if the project exists (or prompt to create it)
- Enable required Google Cloud APIs
- Create a PostgreSQL 15 Cloud SQL instance
- Create the database and user
- Generate a secure password
- Display connection details

**Important:** Save the generated password securely!

**Note:** If the project doesn't exist, the script will prompt you to create it or use an existing one.

### Option 2: Manual Setup

If you prefer to set up manually or customize the configuration:

```bash
# Set your project
export PROJECT_ID="destockify-prod"
gcloud config set project $PROJECT_ID

# Enable APIs
gcloud services enable sqladmin.googleapis.com \
  run.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com

# Create instance
gcloud sql instances create destockify-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup

# Create database
gcloud sql databases create destockify_prod \
  --instance=destockify-db

# Create user
gcloud sql users create destockify_user \
  --instance=destockify-db \
  --password=YOUR_SECURE_PASSWORD

# Get connection name
gcloud sql instances describe destockify-db \
  --format="value(connectionName)"
```

## Local Development Setup

### 1. Configure Environment Variables

Copy and update `.env.local`:

```bash
cd api
cp .env.local.example .env.local
# Edit .env.local with your database credentials
```

Key variables:
- `DATABASE_URL` - Connection string for local development
- `CLOUD_SQL_INSTANCE` - Full connection name (PROJECT:REGION:INSTANCE)
- `DB_USER`, `DB_NAME`, `DB_PASSWORD` - Database credentials

### 2. Start Cloud SQL Proxy

In a separate terminal, start the Cloud SQL Proxy:

```bash
# Get connection name
CONNECTION_NAME=$(gcloud sql instances describe destockify-db --format="value(connectionName)")

# Start proxy (listens on localhost:5432)
cloud-sql-proxy $CONNECTION_NAME
```

The proxy will forward connections from `127.0.0.1:5432` to your Cloud SQL instance.

### 3. Update .env.local

Set your `DATABASE_URL` in `.env.local`:

```env
DATABASE_URL=postgresql://destockify_user:YOUR_PASSWORD@127.0.0.1:5432/destockify_prod?schema=public
```

### 4. Run Migrations

```bash
cd api
npm install
npm run prisma:generate
npm run prisma:migrate:dev
```

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

## Production Setup

### 1. Configure Environment Variables

Update `.env.prod` with production values:

```env
DATABASE_URL=postgresql://destockify_user:PASSWORD@localhost:5432/destockify_prod?host=/cloudsql/PROJECT:REGION:INSTANCE&schema=public
```

**Important:** The production `DATABASE_URL` uses a Unix socket connection via the `host=/cloudsql/...` parameter. This is required for Cloud Run deployments.

### 2. Store Secrets in Secret Manager

For production, store sensitive values in Google Secret Manager:

```bash
# Set project
export PROJECT_ID="destockify-prod"

# Create secrets
echo -n "your-database-url" | gcloud secrets create DATABASE_URL --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "your-jwt-refresh-secret" | gcloud secrets create JWT_REFRESH_SECRET --data-file=-

# Grant Cloud Run service account access
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy to Cloud Run

When deploying to Cloud Run, ensure:

1. **Cloud SQL Connection**: Add the Cloud SQL instance connection to your Cloud Run service:
   ```bash
   gcloud run deploy destockify-api \
     --add-cloudsql-instances=PROJECT:REGION:INSTANCE \
     --set-secrets=DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest \
     ...
   ```

2. **Service Account**: The service account needs:
   - `roles/cloudsql.client` - To connect to Cloud SQL
   - `roles/secretmanager.secretAccessor` - To read secrets

### 4. Run Production Migrations

After deployment, run migrations:

```bash
# Option A: Via Cloud SQL Proxy (local)
./migrate-and-seed.sh

# Option B: Via Cloud Run job
gcloud run jobs create destockify-migrate \
  --image=gcr.io/PROJECT/destockify-api \
  --command="npm,run,prisma:migrate" \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest \
  --add-cloudsql-instances=PROJECT:REGION:INSTANCE
```

## Database Connection Patterns

### Local Development
```
Application → Cloud SQL Proxy (localhost:5432) → Cloud SQL Instance
```
Connection string: `postgresql://user:pass@127.0.0.1:5432/db?schema=public`

### Production (Cloud Run)
```
Cloud Run Service → Unix Socket (/cloudsql/PROJECT:REGION:INSTANCE) → Cloud SQL Instance
```
Connection string: `postgresql://user:pass@localhost:5432/db?host=/cloudsql/PROJECT:REGION:INSTANCE&schema=public`

## Troubleshooting

### Connection Refused (Local)

**Problem:** Can't connect to database locally

**Solutions:**
1. Ensure Cloud SQL Proxy is running: `cloud-sql-proxy CONNECTION_NAME`
2. Check proxy is listening on port 5432: `lsof -i :5432`
3. Verify `DATABASE_URL` uses `127.0.0.1:5432` (not `localhost`)
4. Check firewall rules allow connections

### Authentication Failed

**Problem:** Database authentication errors

**Solutions:**
1. Verify username and password in `.env.local`
2. Reset password: `gcloud sql users set-password USER --instance=INSTANCE --password=NEW_PASSWORD`
3. Check user exists: `gcloud sql users list --instance=INSTANCE`

### Cloud Run Connection Issues

**Problem:** Can't connect from Cloud Run

**Solutions:**
1. Verify `--add-cloudsql-instances` flag includes correct connection name
2. Check service account has `roles/cloudsql.client` role
3. Ensure `DATABASE_URL` includes `host=/cloudsql/...` parameter
4. Check Cloud Run logs for detailed error messages

### Migration Errors

**Problem:** Prisma migrations fail

**Solutions:**
1. Ensure Prisma Client is generated: `npm run prisma:generate`
2. Check database exists: `gcloud sql databases list --instance=INSTANCE`
3. Verify connection string format is correct
4. Check Prisma schema matches database state

## Database Maintenance

### Backup

Cloud SQL automatically creates backups. To create a manual backup:

```bash
gcloud sql backups create --instance=destockify-db
```

### Restore

```bash
gcloud sql backups restore BACKUP_ID --instance=destockify-db
```

### View Backups

```bash
gcloud sql backups list --instance=destockify-db
```

### Connect via psql (Local)

```bash
# With Cloud SQL Proxy running
psql "postgresql://destockify_user:PASSWORD@127.0.0.1:5432/destockify_prod"
```

### Connect via Cloud SQL Admin

```bash
gcloud sql connect destockify-db --user=destockify_user --database=destockify_prod
```

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use Secret Manager** for production secrets
3. **Rotate passwords** regularly
4. **Use least privilege** - Grant minimal IAM roles
5. **Enable SSL** for production connections (Cloud SQL uses SSL by default)
6. **Restrict IP access** - Use Cloud SQL Proxy or authorized networks
7. **Monitor access logs** - Review Cloud SQL audit logs regularly

## Cost Optimization

- **Free Tier**: Use `db-f1-micro` tier for development
- **Production**: Start with `db-custom-1-3840` and scale as needed
- **Storage**: Enable auto-increase to avoid manual scaling
- **Backups**: Configure retention policy to manage costs

## Additional Resources

- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud SQL Proxy Guide](https://cloud.google.com/sql/docs/postgres/sql-proxy)
- [Prisma with Cloud SQL](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-google-cloud-run)
- [Cloud Run with Cloud SQL](https://cloud.google.com/sql/docs/postgres/connect-run)

