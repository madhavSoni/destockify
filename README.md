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
- PostgreSQL 15+

## Backend setup (`api/`)

```bash
cd destockify/api
npm install

# Set up environment variables
cp .env.example .env.local
# update DATABASE_URL and other secrets

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
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL (defaults to http://localhost:8080/api)

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

Backend (`api/.env` example):

```
DATABASE_URL="postgresql://USER:PASS@localhost:5432/destockify?schema=public"
JWT_SECRET="change-me"
JWT_REFRESH_SECRET="change-me"
GCS_PROJECT_ID=""
GCS_BUCKET_NAME="destockify-media-dev"
CORS_ORIGINS="http://localhost:3000"
```

Frontend (`web-frontend/.env` example):

```
NEXT_PUBLIC_API_URL="http://localhost:8080/api"
```

## Deployment notes

- The API includes Google Secret Manager helpers for Cloud Run compatibility.
- Static assets for supplier imagery default to `https://via.placeholder.com` placeholders; replace with CDN-backed imagery in production.
- Update CORS origins and secret management before deploying to production.

## License

Internal project – no public license.
