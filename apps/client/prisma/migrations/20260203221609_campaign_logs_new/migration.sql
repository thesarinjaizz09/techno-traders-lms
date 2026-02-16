-- AlterTable
ALTER TABLE "CampaignLog" ADD COLUMN     "event" TEXT,
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "recipientId" TEXT,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
