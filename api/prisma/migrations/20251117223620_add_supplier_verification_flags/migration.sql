-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "isScam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
