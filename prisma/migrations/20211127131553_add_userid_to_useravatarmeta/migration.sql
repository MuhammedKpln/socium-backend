/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserAvatarMeta` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserAvatarMeta" ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "UserAvatarMeta_userId_key" ON "UserAvatarMeta"("userId");

-- AddForeignKey
ALTER TABLE "UserAvatarMeta" ADD CONSTRAINT "UserAvatarMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
