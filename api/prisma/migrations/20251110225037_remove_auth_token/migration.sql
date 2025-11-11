/*
  Warnings:

  - You are about to drop the column `authToken` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `authTokenExpiry` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "authToken",
DROP COLUMN "authTokenExpiry";
