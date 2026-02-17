// features/messages/router.ts
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger"; // ← Your production Pino logger
import z from "zod";
import { TRPCError } from "@trpc/server";

// ────────────────────────────────────────────────
// Enhanced input schema with stricter defaults & comments
// ────────────────────────────────────────────────
const getInfiniteInput = z.object({
  limit: z.number().min(1).max(100).default(20), // Increased max to 100 for flexibility, but cap for perf
  cursor: z.uuid().nullable().optional(), // Enforce UUID format for cursor (assuming id is UUID)
});

// ────────────────────────────────────────────────
// Production-grade router
// ────────────────────────────────────────────────
export const messagesRouter = createTRPCRouter({
  /**
   * 🔄 Cursor-based infinite list (newest → oldest)
   * 
   * Production notes:
   * - Logs query metrics for observability
   * - Handles edge cases (e.g., invalid cursor → TRPCError)
   * - Maps response with sanitized fields (no raw timestamps)
   * - Optional: Add caching layer (e.g., React Query on client, Redis on server) later
   */
  getInfinite: protectedProcedure
    .input(getInfiniteInput)
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const userId = ctx.session.user.id;

      // ─── Logging: Start of query ───
      const queryStart = Date.now();
      const queryLogger = logger.child({
        userId,
        operation: "getInfiniteMessages",
        limit,
        cursor: cursor || "initial",
      });
      queryLogger.debug("Fetching messages");

      let messages;
      try {
        messages = await prisma.message.findMany({
          take: limit + 1, // +1 for next cursor detection
          ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
          }),
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        });
      } catch (err) {
        queryLogger.error({ err }, "Database query failed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch messages",
        });
      }

      // ─── Validate cursor if provided (edge case: invalid UUID already caught by Zod) ───
      if (cursor && messages.length === 0) {
        queryLogger.warn({ cursor }, "Cursor returned no results – possible invalid or exhausted");
        // Don't throw; just return empty list (graceful degradation)
      }

      // ─── Pagination logic ───
      let nextCursor: string | null = null;
      if (messages.length > limit) {
        const nextItem = messages.pop()!;
        nextCursor = nextItem.id;
        queryLogger.debug({ nextCursor }, "Next cursor computed");
      }

      // ─── Transform response (sanitize & format) ───
      const items = messages.map((m) => ({
        id: m.id,
        user: m.user.name ?? "Anonymous", // Fallback for null names
        role: m.userId === userId ? "you" : "member",
        message: m.content.trim(), // Basic sanitization (trim whitespace)
        time: m.createdAt.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false, // 24-hour format for consistency
        }),
      }));

      // ─── Logging: End of query (metrics) ───
      const queryDuration = Date.now() - queryStart;
      queryLogger.info({
        itemsCount: items.length,
        nextCursor: !!nextCursor,
        durationMs: queryDuration,
      }, "Messages fetched successfully");

      // Optional: If queryDuration > threshold, alert (e.g., via Sentry)
      if (queryDuration > 500) {
        queryLogger.warn({ queryDuration }, "Slow query detected");
      }

      return {
        items,
        nextCursor,
      };
    }),
});