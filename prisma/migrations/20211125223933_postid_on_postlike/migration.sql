/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `PostLike` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `postId` to the `PostLike` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Posts" DROP CONSTRAINT "Posts_postLikeId_fkey";

-- AlterTable
ALTER TABLE "PostLike" ADD COLUMN     "postId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_key" ON "PostLike"("postId");

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
