-- CreateTable
CREATE TABLE "SupplierSubmission" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "website" TEXT,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "hoursOfOperation" JSONB,
    "socialMedia" JSONB,
    "ownershipDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupplierSubmission_customerId_createdAt_idx" ON "SupplierSubmission"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "SupplierSubmission_status_createdAt_idx" ON "SupplierSubmission"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "SupplierSubmission" ADD CONSTRAINT "SupplierSubmission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
