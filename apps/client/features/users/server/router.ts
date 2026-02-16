import { prisma } from "@/lib/db"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const usersRouter = createTRPCRouter({
    getCurrent: protectedProcedure.query(async ({ ctx }) => {
        return prisma.user.findUnique({
            where: { id: ctx.session.user.id }
        })
    })
})