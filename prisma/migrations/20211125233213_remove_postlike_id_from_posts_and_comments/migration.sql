/*
  Warnings:

  - You are about to drop the column `postLikeId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `postLikeId` on the `Posts` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Comment_postLikeId_key";

-- DropIndex
DROP INDEX "Posts_postLikeId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "postLikeId";

-- AlterTable
ALTER TABLE "Posts" DROP COLUMN "postLikeId";
