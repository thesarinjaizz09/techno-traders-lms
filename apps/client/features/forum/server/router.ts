// features/messages/router.ts
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger"; // ← Your production Pino logger
import z from "zod";
import { TRPCError } from "@trpc/server";

// ────────────────────────────────────────────────
// Enhanced input schema: Switch to offset for reliability
// ────────────────────────────────────────────────
const getInfiniteInput = z.object({
  limit: z.number().min(1).max(100).default(20), // Increased max to 100 for flexibility, but cap for perf
  cursor: z.number().nullish(), // Cursor for tRPC infinite queries
});

// ────────────────────────────────────────────────
// Production-grade router
// ────────────────────────────────────────────────
export const messagesRouter = createTRPCRouter({
  getInfinite: protectedProcedure
    .input(getInfiniteInput)
    .query(async ({ ctx, input }) => {
      const { limit } = input;
      const offset = input.cursor ?? 0;
      const userId = ctx.session.user.id;

      // ─── Logging: Start of query ───
      const queryStart = Date.now();
      const queryLogger = logger.child({
        userId,
        operation: "getInfiniteMessages",
        limit,
        offset, // ← Log offset instead of cursor
      });
      queryLogger.debug("Fetching messages");

      let messages;
      try {
        messages = await prisma.message.findMany({
          take: limit + 1, // +1 for next offset detection
          skip: offset, // ← Use skip for offset-based pagination
          orderBy: { createdAt: "desc" }, // Keep desc (newest first)
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
        // queryLogger.debug({ totalInDB: await prisma.message.count(), fetched: messages.length });
      } catch (err) {
        queryLogger.error({ err }, "Database query failed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch messages",
        });
      }

      // ─── Validate offset if provided (edge case: offset too high → empty) ───
      if (offset > 0 && messages.length === 0) {
        queryLogger.warn({ offset }, "Offset returned no results – possible exhausted or invalid");
        // Don't throw; just return empty list (graceful degradation)
      }

      // ─── Pagination logic (offset-based) ───
      let nextCursor: number | null = null; // ← Type as number (offset)
      if (messages.length > limit) {
        messages.pop(); // Remove the extra for items
        nextCursor = offset + limit; // Simple arithmetic for next offset
        queryLogger.debug({ nextCursor }, "Next offset computed");
      } else {
        nextCursor = null; // No more messages
      }

      // ─── Transform response (sanitize & format) ───
      const items = messages.map((m) => ({
        id: m.id,
        user: m.user.name ?? "Anonymous", // Fallback for null names
        role: m.userId === userId ? "you" : "member",
        message: m.content.trim(), // Basic sanitization (trim whitespace)
        createdAt: m.createdAt.toISOString(),
        time: m.createdAt.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true, // 12-hour format with AM/PM
        }),
        type: m.type,
        userId: m.userId,
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
        nextCursor
      };
    }),
});
