# Destockify

Destockify is a wholesale liquidation supplier directory built with a TypeScript/Prisma Express API and a Next.js 15 frontend. The project mirrors the Muse architecture while focusing on vetted liquidation suppliers, reviews, and buyer guides.

## Project structure

```
destockify/
├── api/             # Express + Prisma backend
└── web-frontend/    # Next.js 15 app router frontend
```

## Prerequisites

- Node.js 20+
- npm 10+
- Google Cloud CLI installed and authenticated
- Cloud SQL Proxy installed (for local development)
- Google Cloud project with billing enabled

## Database Setup

Destockify uses Google Cloud SQL (PostgreSQL 15) for both development and production.

### Quick Setup

1. **Create Cloud SQL instance** (automated):
   ```bash
   cd api
   ./setup-cloud-sql.sh
   ```
   This script creates the database instance, database, and user. Save the generated password securely!

2. **For local development**, start Cloud SQL Proxy:
   ```bash
   # Get connection name
   CONNECTION_NAME=$(gcloud sql instances describe destockify-db --format="value(connectionName)")
   
   # Start proxy (in a separate terminal)
   cloud-sql-proxy $CONNECTION_NAME
   ```

3. **Configure environment variables**:
   - Copy `.env.local` and update with your database credentials
   - The `DATABASE_URL` should point to `127.0.0.1:5432` when using Cloud SQL Proxy

4. **Run migrations**:
   ```bash
   cd api
   npm run prisma:generate
   npm run prisma:migrate:dev
   npm run db:seed
   ```

For detailed database setup instructions, see [`api/DATABASE_SETUP.md`](api/DATABASE_SETUP.md).

## Backend setup (`api/`)

```bash
cd destockify/api
npm install

# Set up environment variables
# Copy .env.local and update with your database credentials
# Make sure Cloud SQL Proxy is running (see Database Setup above)

# Generate Prisma client
npm run prisma:generate

# Apply migrations
npm run prisma:migrate:dev

# Seed reference data (categories, suppliers, guides, FAQs)
npm run db:seed

# Start API in development mode
npm run dev
```

The API listens on `http://localhost:8080` by default and exposes endpoints under `/api`:

- `GET /api/home` – homepage aggregate payload
- `GET /api/suppliers` – paginated supplier list with filters
- `GET /api/suppliers/:slug` – supplier detail, reviews, testimonials, related suppliers
- `GET /api/catalog/categories|regions|lot-sizes`
- `GET /api/guides` and `GET /api/guides/:slug`
- `GET /api/faq`

## Frontend setup (`web-frontend/`)

```bash
cd destockify/web-frontend
npm install

# Configure Next.js API URL
# Copy .env.local and update NEXT_PUBLIC_API_URL if needed
# Defaults to http://localhost:8080/api

npm run dev
```

The frontend runs on `http://localhost:3000` and consumes the API endpoints above. Key routes:

- `/` – homepage with hero, featured suppliers, reviews, guides, FAQs
- `/suppliers` – supplier directory with server-rendered filters
- `/suppliers/[slug]` – supplier profile, ratings, testimonials, resources
- `/categories`, `/locations`, `/lot-sizes` – index and detail pages covering the catalog
- `/guides` – buyer playbooks

## Scripts

Backend (`api/`):

- `npm run dev` – start Express server with nodemon
- `npm run build` – compile TypeScript to `dist/`
- `npm run prisma:migrate:dev` – create/apply migrations in development
- `npm run prisma:migrate` – apply migrations in production env
- `npm run db:seed` – seed reference data

Frontend (`web-frontend/`):

- `npm run dev` – Next.js dev server
- `npm run build` – production build
- `npm run start` – start Next.js in production mode
- `npm run lint` – run ESLint

## Environment variables

### Backend (`api/`)

Environment files:
- `.env.local` - Local development configuration
- `.env.prod` - Production configuration template

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
  - Local: `postgresql://user:pass@127.0.0.1:5432/db?schema=public`
  - Production: `postgresql://user:pass@localhost:5432/db?host=/cloudsql/PROJECT:REGION:INSTANCE&schema=public`
- `JWT_SECRET` / `JWT_REFRESH_SECRET` - Authentication secrets
- `GCS_PROJECT_ID` - Google Cloud project ID
- `GCS_BUCKET_NAME` - Cloud Storage bucket name
- `CORS_ORIGINS` - Allowed frontend origins (comma-separated)

See `api/.env.local` and `api/.env.prod` for complete configuration examples.

### Frontend (`web-frontend/`)

Environment files:
- `.env.local` - Local development configuration
- `.env.prod` - Production configuration template

Key variables:
- `NEXT_PUBLIC_API_URL` - Backend API endpoint URL
  - Local: `http://localhost:8080/api`
  - Production: `https://your-api-url.run.app/api`

See `web-frontend/.env.local` and `web-frontend/.env.prod` for configuration examples.

## Deployment notes

### Production Deployment

1. **Database**: Ensure Cloud SQL instance is created and configured (see Database Setup)
2. **Secrets**: Store sensitive values (DATABASE_URL, JWT_SECRET, etc.) in Google Secret Manager
3. **Environment**: Use `.env.prod` as a template, but store actual values in Secret Manager
4. **Cloud Run**: When deploying, add Cloud SQL connection:
   ```bash
   gcloud run deploy destockify-api \
     --add-cloudsql-instances=PROJECT:REGION:INSTANCE \
     --set-secrets=DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest \
     ...
   ```

### Additional Notes

- The API includes Google Secret Manager helpers for Cloud Run compatibility
- Static assets for supplier imagery default to `https://via.placeholder.com` placeholders; replace with CDN-backed imagery in production
- Update CORS origins in `.env.prod` before deploying to production
- Run production migrations: `./migrate-and-seed.sh` (with Cloud SQL Proxy) or via Cloud Run job

## License

Internal project – no public license.
