/*
  Warnings:

  - You are about to drop the column `parentUserId` on the `Comment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentUserId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "parentUserId",
ADD COLUMN     "commentId" INTEGER,
ADD COLUMN     "parentCommentId" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatar" SET DEFAULT E'avatar1';

-- CreateTable
CREATE TABLE "_parentComment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_parentComment_AB_unique" ON "_parentComment"("A", "B");

-- CreateIndex
CREATE INDEX "_parentComment_B_index" ON "_parentComment"("B");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_parentComment" ADD FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_parentComment" ADD FOREIGN KEY ("B") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
