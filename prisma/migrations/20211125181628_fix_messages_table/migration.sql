/*
  Warnings:

  - You are about to drop the column `userId` on the `Messages` table. All the data in the column will be lost.
  - Made the column `roomId` on table `Messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `senderId` on table `Messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `receiverId` on table `Messages` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_userId_fkey";

-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "userId",
ALTER COLUMN "roomId" SET NOT NULL,
ALTER COLUMN "senderId" SET NOT NULL,
ALTER COLUMN "receiverId" SET NOT NULL;
