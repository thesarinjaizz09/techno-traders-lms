/*
  Warnings:

  - A unique constraint covering the columns `[userId,email]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Lead_userId_email_idx";

-- CreateIndex
CREATE INDEX "Lead_userId_idx" ON "Lead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_userId_email_key" ON "Lead"("userId", "email");
