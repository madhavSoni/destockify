-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "isTrending" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Review_supplierId_isTrending_isApproved_idx" ON "Review"("supplierId", "isTrending", "isApproved");
