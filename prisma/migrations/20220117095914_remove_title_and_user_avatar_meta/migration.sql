/*
  Warnings:

  - You are about to drop the column `title` on the `Posts` table. All the data in the column will be lost.
  - You are about to drop the `UserAvatarMeta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAvatarMeta" DROP CONSTRAINT "UserAvatarMeta_userId_fkey";

-- AlterTable
ALTER TABLE "NotificationSettings" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Posts" DROP COLUMN "title",
ADD COLUMN     "additional" TEXT;

-- DropTable
DROP TABLE "UserAvatarMeta";
