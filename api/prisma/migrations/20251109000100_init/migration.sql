-- CreateTable: Category
CREATE TABLE "Category" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Category_slug_key" ON "Category" ("slug");

-- CreateTable: Region
CREATE TABLE "Region" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT,
    "description" TEXT,
    "stateCode" TEXT,
    "marketStats" JSONB,
    "mapImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Region_slug_key" ON "Region" ("slug");

-- CreateTable: LotSize
CREATE TABLE "LotSize" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT,
    "description" TEXT,
    "minUnits" INTEGER,
    "maxUnits" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "LotSize_slug_key" ON "LotSize" ("slug");

-- CreateTable: Supplier
CREATE TABLE "Supplier" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "heroImage" TEXT,
    "logoImage" TEXT,
    "averageRating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "trustScore" INTEGER,
    "minimumOrder" TEXT,
    "leadTime" TEXT,
    "specialties" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "badges" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "logisticsNotes" TEXT,
    "pricingNotes" TEXT,
    "homeRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regionId" INTEGER REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Supplier_slug_key" ON "Supplier" ("slug");
CREATE INDEX "Supplier_regionId_idx" ON "Supplier" ("regionId");
CREATE INDEX "Supplier_homeRank_idx" ON "Supplier" ("homeRank");

-- CreateTable: SupplierCategory join
CREATE TABLE "SupplierCategory" (
    "supplierId" INTEGER NOT NULL REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "categoryId" INTEGER NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("supplierId", "categoryId")
);

-- CreateTable: SupplierLotSize join
CREATE TABLE "SupplierLotSize" (
    "supplierId" INTEGER NOT NULL REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "lotSizeId" INTEGER NOT NULL REFERENCES "LotSize"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("supplierId", "lotSizeId")
);

-- CreateTable: Review
CREATE TABLE "Review" (
    "id" SERIAL PRIMARY KEY,
    "supplierId" INTEGER NOT NULL REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "company" TEXT,
    "ratingOverall" DOUBLE PRECISION NOT NULL,
    "ratingAccuracy" DOUBLE PRECISION,
    "ratingLogistics" DOUBLE PRECISION,
    "ratingValue" DOUBLE PRECISION,
    "ratingCommunication" DOUBLE PRECISION,
    "highlights" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "body" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Review_supplierId_publishedAt_idx" ON "Review" ("supplierId", "publishedAt");

-- CreateTable: Testimonial
CREATE TABLE "Testimonial" (
    "id" SERIAL PRIMARY KEY,
    "supplierId" INTEGER NOT NULL REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "quote" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Testimonial_supplierId_publishedAt_idx" ON "Testimonial" ("supplierId", "publishedAt");

-- CreateTable: SupplierResource
CREATE TABLE "SupplierResource" (
    "id" SERIAL PRIMARY KEY,
    "supplierId" INTEGER NOT NULL REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX "SupplierResource_supplierId_order_idx" ON "SupplierResource" ("supplierId", "order");

-- CreateTable: Guide
CREATE TABLE "Guide" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "intro" TEXT,
    "heroImage" TEXT,
    "excerpt" TEXT,
    "sections" JSONB,
    "publishedAt" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Guide_slug_key" ON "Guide" ("slug");

-- CreateTable: GuideCategory join
CREATE TABLE "GuideCategory" (
    "guideId" INTEGER NOT NULL REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "categoryId" INTEGER NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("guideId", "categoryId")
);

-- CreateTable: Faq
CREATE TABLE "Faq" (
    "id" SERIAL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "audience" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

