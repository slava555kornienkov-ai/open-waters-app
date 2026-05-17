import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { supportMessages } from "@db/schema";
import { eq, desc, asc } from "drizzle-orm";

export const supportRouter = createRouter({
  messages: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.supportMessages.findMany({
      where: eq(supportMessages.userId, ctx.user.id),
      orderBy: [asc(supportMessages.createdAt)],
      limit: 100,
    });
  }),

  send: authedQuery
    .input(z.object({ text: z.string().min(1).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(supportMessages).values({
        userId: ctx.user.id,
        sender: "user",
        text: input.text,
      });
      return { success: true };
    }),

  // Admin endpoint
  allChats: adminQuery.query(async () => {
    const db = getDb();
    const msgs = await db.query.supportMessages.findMany({
      orderBy: [desc(supportMessages.createdAt)],
      limit: 500,
    });
    // Group by user
    const grouped = new Map<number, typeof msgs>();
    for (const msg of msgs) {
      const list = grouped.get(msg.userId) || [];
      list.push(msg);
      grouped.set(msg.userId, list);
    }
    return Array.from(grouped.entries()).map(([userId, messages]) => ({
      userId,
      messages: messages.reverse(),
      lastMessage: messages[0],
    }));
  }),

  replyAsAdmin: adminQuery
    .input(z.object({ userId: z.number(), text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(supportMessages).values({
        userId: input.userId,
        sender: "admin",
        text: input.text,
      });
      return { success: true };
    }),
});
