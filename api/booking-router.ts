import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, users } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { sendTelegramMessage, bookingConfirmed } from "./telegram-bot";

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

  create: publicQuery
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
      telegramChatId: z.number().optional(),
      userId: z.number().optional(),
      name: z.string().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const bookingNumber = `OW${Date.now().toString(36).toUpperCase()}`;
      const earnedBonuses = Math.round(input.totalPrice * 0.05);
      const qrCode = `ow-check-${Date.now()}`;

      // Create or get user
      let userId = input.userId;
      if (!userId && input.telegramChatId) {
        const existing = await db.select().from(users).where(eq(users.telegramId, String(input.telegramChatId))).limit(1);
        if (existing.length > 0) {
          userId = existing[0].id;
        } else if (input.name) {
          const result = await db.insert(users).values({
            telegramId: String(input.telegramChatId),
            name: input.name,
            phone: input.phone || "",
            referralCode: `OW-${input.name.toUpperCase().replace(/\s/g, "-")}-${Math.floor(Math.random() * 9000 + 1000)}`,
            bonusBalance: 300,
            visitsCount: 0,
            totalSpent: 0,
            role: "user",
            invitedCount: 0,
            earnedFromReferrals: 0,
          });
          userId = Number(result[0].insertId);
        }
      }

      const result = await db.insert(bookings).values({
        bookingNumber,
        userId: userId || 0,
        phone: input.phone || "",
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
        telegramChatId: input.telegramChatId,
      } as typeof bookings.$inferInsert);

      // Deduct bonuses
      if (userId && input.usedBonuses > 0) {
        await db.update(users)
          .set({ bonusBalance: { sql: `bonusBalance - ${input.usedBonuses}` } as any })
          .where(eq(users.id, userId));
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

  // ─── EMPLOYEE ACTIONS ──────────────────────────────────

  /** Employee confirms client arrival (scan QR or manual) */
  confirmByEmployee: publicQuery
    .input(z.object({
      bookingId: z.number(),
      employeeId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, input.bookingId),
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== "pending") {
        throw new Error("Booking already processed");
      }

      // Update booking
      await db.update(bookings)
        .set({
          status: "confirmed",
          confirmedBy: input.employeeId,
          confirmedAt: new Date(),
        })
        .where(eq(bookings.id, input.bookingId));

      // Send confirmation message to client
      if (booking.telegramChatId) {
        await sendTelegramMessage(
          booking.telegramChatId,
          bookingConfirmed({
            date: booking.date.toISOString().split("T")[0],
            time: booking.time,
            duration: booking.duration,
            boards: booking.boards,
          })
        );
      }

      return { success: true, message: "Booking confirmed" };
    }),

  /** Employee marks visit as completed (client left) */
  completeVisit: publicQuery
    .input(z.object({
      bookingId: z.number(),
      employeeId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, input.bookingId),
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== "confirmed") {
        throw new Error("Booking not confirmed");
      }

      await db.update(bookings)
        .set({ status: "completed" })
        .where(eq(bookings.id, input.bookingId));

      // Update user stats
      if (booking.userId) {
        await db.update(users)
          .set({
            visitsCount: { sql: `visitsCount + 1` } as any,
            totalSpent: { sql: `totalSpent + ${booking.totalPrice}` } as any,
            bonusBalance: { sql: `bonusBalance + ${booking.earnedBonuses}` } as any,
          })
          .where(eq(users.id, booking.userId));
      }

      return { success: true, message: "Visit completed" };
    }),
});
