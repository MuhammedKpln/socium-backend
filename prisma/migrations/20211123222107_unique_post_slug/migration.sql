/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Posts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Posts_slug_key" ON "Posts"("slug");
