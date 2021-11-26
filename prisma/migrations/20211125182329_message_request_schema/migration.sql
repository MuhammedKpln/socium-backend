/*
  Warnings:

  - You are about to drop the `message_request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "message_request" DROP CONSTRAINT "message_request_requestFromId_fkey";

-- DropForeignKey
ALTER TABLE "message_request" DROP CONSTRAINT "message_request_requestToId_fkey";

-- DropTable
DROP TABLE "message_request";

-- CreateTable
CREATE TABLE "MessageRequest" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request" BOOLEAN NOT NULL DEFAULT true,
    "requestFromId" INTEGER,
    "requestToId" INTEGER,

    CONSTRAINT "MessageRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MessageRequest" ADD CONSTRAINT "MessageRequest_requestFromId_fkey" FOREIGN KEY ("requestFromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MessageRequest" ADD CONSTRAINT "MessageRequest_requestToId_fkey" FOREIGN KEY ("requestToId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
