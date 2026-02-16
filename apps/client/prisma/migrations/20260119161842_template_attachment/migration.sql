-- CreateTable
CREATE TABLE "TemplateAttachment" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemplateAttachment_templateId_idx" ON "TemplateAttachment"("templateId");

-- AddForeignKey
ALTER TABLE "TemplateAttachment" ADD CONSTRAINT "TemplateAttachment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
