/*
  Warnings:

  - A unique constraint covering the columns `[roomAdress]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Room_roomAdress_key" ON "Room"("roomAdress");
