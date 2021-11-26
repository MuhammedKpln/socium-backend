/*
  Warnings:

  - A unique constraint covering the columns `[commentId]` on the table `PostLike` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postLikeId_fkey";

-- AlterTable
ALTER TABLE "PostLike" ADD COLUMN     "commentId" INTEGER,
ALTER COLUMN "postId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_commentId_key" ON "PostLike"("commentId");

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
