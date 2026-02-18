-- DropIndex
DROP INDEX "public"."Lead_userId_idx";

-- CreateIndex
CREATE INDEX "Lead_userId_email_idx" ON "Lead"("userId", "email");
