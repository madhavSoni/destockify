-- DropForeignKey
ALTER TABLE "GuideCategory" DROP CONSTRAINT "GuideCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "GuideCategory" DROP CONSTRAINT "GuideCategory_guideId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierCategory" DROP CONSTRAINT "SupplierCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierCategory" DROP CONSTRAINT "SupplierCategory_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierLotSize" DROP CONSTRAINT "SupplierLotSize_lotSizeId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierLotSize" DROP CONSTRAINT "SupplierLotSize_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierResource" DROP CONSTRAINT "SupplierResource_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Testimonial" DROP CONSTRAINT "Testimonial_supplierId_fkey";

-- DropIndex
DROP INDEX "Supplier_homeRank_idx";

-- DropIndex
DROP INDEX "Supplier_regionId_idx";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Faq" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Guide" ALTER COLUMN "publishedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LotSize" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Region" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "averageRating" SET DEFAULT 0,
ALTER COLUMN "trustScore" SET DEFAULT 0,
ALTER COLUMN "homeRank" SET DEFAULT 0,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "SupplierCategory" ADD CONSTRAINT "SupplierCategory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCategory" ADD CONSTRAINT "SupplierCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierLotSize" ADD CONSTRAINT "SupplierLotSize_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierLotSize" ADD CONSTRAINT "SupplierLotSize_lotSizeId_fkey" FOREIGN KEY ("lotSizeId") REFERENCES "LotSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierResource" ADD CONSTRAINT "SupplierResource_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideCategory" ADD CONSTRAINT "GuideCategory_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideCategory" ADD CONSTRAINT "GuideCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
