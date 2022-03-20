/*
  Warnings:

  - You are about to drop the column `commentId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the `_parentComment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commentId_fkey";

-- DropForeignKey
ALTER TABLE "_parentComment" DROP CONSTRAINT "_parentComment_A_fkey";

-- DropForeignKey
ALTER TABLE "_parentComment" DROP CONSTRAINT "_parentComment_B_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "commentId";

-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "repliedToMessageId" INTEGER;

-- DropTable
DROP TABLE "_parentComment";

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_repliedToMessageId_fkey" FOREIGN KEY ("repliedToMessageId") REFERENCES "Messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
