import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, users } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const bookingRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.bookings.findMany({
      where: eq(bookings.userId, ctx.user.id),
      orderBy: [bookings.createdAt],
    });
  }),

  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.bookings.findFirst({
        where: eq(bookings.id, input.id),
      });
    }),

  create: authedQuery
    .input(z.object({
      date: z.string(),
      time: z.string(),
      duration: z.number().min(1).max(11),
      boards: z.number().min(1).max(20),
      instructor: z.boolean(),
      rescuers: z.boolean(),
      isWeekend: z.boolean(),
      totalPrice: z.number(),
      usedBonuses: z.number().default(0),
      paymentMethod: z.enum(["qr", "card"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const bookingNumber = `OW${Date.now().toString(36).toUpperCase()}`;
      const earnedBonuses = Math.round(input.totalPrice * 0.05);
      const qrCode = `ow-check-${ctx.user.id}-${Date.now()}`;

      const result = await db.insert(bookings).values({
        bookingNumber: bookingNumber,
        userId: ctx.user.id,
        phone: ctx.user.phone ?? "",
        date: new Date(input.date),
        time: input.time,
        duration: input.duration,
        boards: input.boards,
        instructor: input.instructor,
        rescuers: input.rescuers,
        totalPrice: input.totalPrice,
        usedBonuses: input.usedBonuses,
        earnedBonuses,
        paymentStatus: input.paymentMethod,
        status: "pending",
        qrCode,
        isWeekend: input.isWeekend,
      } as typeof bookings.$inferInsert);

      // Deduct bonuses
      if (input.usedBonuses > 0) {
        await db.update(users)
          .set({ bonusBalance: ctx.user.bonusBalance - input.usedBonuses })
          .where(eq(users.id, ctx.user.id));
      }

      return { bookingNumber, id: Number(result[0].insertId) };
    }),

  cancel: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(bookings)
        .set({ status: "cancelled" })
        .where(and(eq(bookings.id, input.id), eq(bookings.userId, ctx.user.id)));
      return { success: true };
    }),

  availableSlots: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const dayBookings = await db.query.bookings.findMany({
        where: and(eq(bookings.date, new Date(input.date)), eq(bookings.status, "confirmed")),
      });
      const bookedSlots = dayBookings.map((b) => b.time);
      const allSlots = Array.from({ length: 11 }, (_, i) => `${10 + i}:00`);
      return allSlots.map((slot) => ({
        time: slot,
        available: !bookedSlots.includes(slot),
      }));
    }),
});
