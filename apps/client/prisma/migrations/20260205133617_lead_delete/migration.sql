-- DropForeignKey
ALTER TABLE "public"."CampaignRecipient" DROP CONSTRAINT "CampaignRecipient_leadId_fkey";

-- AddForeignKey
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
