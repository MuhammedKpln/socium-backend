/*
  Warnings:

  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[description]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "slug",
ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_description_key" ON "Category"("description");
