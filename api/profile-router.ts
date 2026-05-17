import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, bookings } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const profileRouter = createRouter({
  me: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });
    return user ?? null;
  }),

  visitHistory: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const history = await db.query.bookings.findMany({
      where: eq(bookings.userId, ctx.user.id),
      orderBy: [desc(bookings.createdAt)],
      limit: 20,
    });
    return history;
  }),

  refreshQr: authedQuery.mutation(async ({ ctx }) => {
    const qrData = `ow-${ctx.user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { qrData };
  }),

  referralStats: authedQuery.query(async ({ ctx }) => {
    const invitedCount = 0;
    const earnedBonuses = 0;
    return { invitedCount, earnedBonuses, referralCode: ctx.user.referralCode };
  }),

  updateProfile: authedQuery
    .input(z.object({
      name: z.string().min(1).max(100).optional(),
      phone: z.string().max(20).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(users).set(input).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});
