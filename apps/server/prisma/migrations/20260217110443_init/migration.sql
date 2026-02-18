/*
  Warnings:

  - You are about to drop the column `dailyEmailLimit` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `emailsSentToday` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastQuotaResetAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `Campaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CampaignLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CampaignRecipient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lead` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateAttachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Campaign" DROP CONSTRAINT "Campaign_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Campaign" DROP CONSTRAINT "Campaign_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CampaignLog" DROP CONSTRAINT "CampaignLog_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CampaignRecipient" DROP CONSTRAINT "CampaignRecipient_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CampaignRecipient" DROP CONSTRAINT "CampaignRecipient_leadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmailTemplate" DROP CONSTRAINT "EmailTemplate_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lead" DROP CONSTRAINT "Lead_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateAttachment" DROP CONSTRAINT "TemplateAttachment_templateId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "dailyEmailLimit",
DROP COLUMN "emailsSentToday",
DROP COLUMN "lastQuotaResetAt";

-- DropTable
DROP TABLE "public"."Campaign";

-- DropTable
DROP TABLE "public"."CampaignLog";

-- DropTable
DROP TABLE "public"."CampaignRecipient";

-- DropTable
DROP TABLE "public"."EmailTemplate";

-- DropTable
DROP TABLE "public"."Lead";

-- DropTable
DROP TABLE "public"."TemplateAttachment";

-- DropEnum
DROP TYPE "public"."CampaignLogLevel";

-- DropEnum
DROP TYPE "public"."CampaignRecipientStatus";

-- DropEnum
DROP TYPE "public"."CampaignStatus";

-- DropEnum
DROP TYPE "public"."ContentMode";

-- DropEnum
DROP TYPE "public"."LeadStatus";

-- DropEnum
DROP TYPE "public"."MailStatus";

-- DropEnum
DROP TYPE "public"."Source";

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageRead_userId_messageId_key" ON "MessageRead"("userId", "messageId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
