/*
  Warnings:

  - Made the column `userId` on table `Posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `postLikeId` on table `Posts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Posts" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "postLikeId" SET NOT NULL;
