import z from "zod"
import { prisma } from "@/lib/db"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { CampaignLogLevel, CampaignStatus, LeadStatus, Source } from "@/lib/generated/prisma/enums"
import { Prisma } from "@/lib/generated/prisma/client"

export const usersRouter = createTRPCRouter({
    getCurrent: protectedProcedure.query(async ({ ctx }) => {
        return prisma.user.findUnique({
            where: { id: ctx.session.user.id },
            select: {
                id: true,
                dailyEmailLimit: true,
                emailsSentToday: true,
            },
        })
    })
})