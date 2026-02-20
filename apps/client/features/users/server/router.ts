import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { logger } from "@/lib/logger";

// ────────────────────────────────────────────────
// Optional: Select only safe/public fields
// ────────────────────────────────────────────────
const CURRENT_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  isMember: true,
} as const;

// ────────────────────────────────────────────────
// Router
// ────────────────────────────────────────────────
export const usersRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const log = logger.child({
      component: "usersRouter",
      operation: "getCurrent",
      userId,
    });

    log.debug("Fetching current user");

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          ...CURRENT_USER_SELECT,
          sessions: {
            select: {
              token: true,
            },
          },
        },
      });


      if (!user) {
        log.warn("Current user not found in database (possible deletion)");
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      log.info("Current user fetched successfully");
      return user;

    } catch (err) {
      if (err instanceof TRPCError) throw err; // re-throw known errors

      log.error({ err }, "Failed to fetch current user");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve user information",
      });
    }
  }),

  createSystemMessage: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const log = logger.child({
      component: "usersRouter",
      operation: "createSystemMessage",
      userId,
    });

    log.debug("Creating system message");

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          ...CURRENT_USER_SELECT,
          sessions: {
            select: {
              token: true,
            },
          },
        },
      });

      if (!user) {
        log.warn("Current user not found in database (possible deletion)");
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const message = await prisma.message.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          type: "SYSTEM",
          content: `${user.name} joined the community`,
        },
      });

      log.info("System message created successfully");
      return message;

    } catch (err) {
      if (err instanceof TRPCError) throw err; // re-throw known errors

      log.error({ err }, "Failed to create system message");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create system message",
      });
    }
  }),

  becomeMember: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const log = logger.child({
      component: "usersRouter",
      operation: "becomeMember",
      userId,
    });

    log.debug("Making user a member");

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1️⃣ Update user → member
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            isMember: true,
          },
        });

        // 2️⃣ Create system message
        const message = await tx.privateMessage.create({
          data: {
            userId: user.id, // cleaner than connect
            type: "SYSTEM",
            content: `${user.name} joined the exclusive community`,
          },
        });

        return message;
      });

      log.info("User made a member successfully");
      return result;

    } catch (err) {
      if (err instanceof TRPCError) throw err;

      log.error({ err }, "Failed to make user a member");

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to make user a member",
      });
    }
  })
});