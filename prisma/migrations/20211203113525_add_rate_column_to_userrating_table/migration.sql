/*
  Warnings:

  - Added the required column `rate` to the `UserRating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserRating" ADD COLUMN     "rate" INTEGER NOT NULL;
