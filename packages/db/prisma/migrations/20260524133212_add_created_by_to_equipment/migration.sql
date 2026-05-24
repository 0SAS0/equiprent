/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ssoProvider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ssoSubject` on the `User` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_ssoSubject_idx";

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash",
DROP COLUMN "ssoProvider",
DROP COLUMN "ssoSubject";

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
