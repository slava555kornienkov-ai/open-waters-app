import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, users } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const adminRouter = createRouter({
  dashboard: adminQuery.query(async () => {
    const db = getDb();
    const allBookings = await db.query.bookings.findMany({});
    const allUsers = await db.query.users.findMany({});

    const totalRevenue = allBookings
      .filter((b) => b.status === "completed" || b.status === "confirmed")
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const totalBookings = allBookings.length;
    const activeUsers = allUsers.length;
    const pendingPayments = allBookings.filter((b) => b.paymentStatus === "pending" || b.paymentStatus === "qr" || b.paymentStatus === "card").length;

    // Monthly revenue
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthlyRevenue = allBookings
      .filter((b) => b.createdAt.toISOString().startsWith(currentMonth))
      .reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      totalRevenue,
      totalBookings,
      activeUsers,
      pendingPayments,
      monthlyRevenue,
      recentBookings: allBookings.slice(-10).reverse(),
    };
  }),

  confirmPayment: adminQuery
    .input(z.object({ bookingId: z.number(), status: z.enum(["confirmed", "declined"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(bookings)
        .set({ paymentStatus: input.status })
        .where(eq(bookings.id, input.bookingId));

      if (input.status === "confirmed") {
        // Mark booking as confirmed
        await db.update(bookings)
          .set({ status: "confirmed" })
          .where(eq(bookings.id, input.bookingId));
      }

      return { success: true };
    }),

  confirmVisit: adminQuery
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, input.bookingId),
      });
      if (!booking) throw new Error("Бронирование не найдено");

      // Mark completed
      await db.update(bookings)
        .set({ status: "completed" })
        .where(eq(bookings.id, input.bookingId));

      // Add earned bonuses
      await db.update(users)
        .set({
          bonusBalance: sql`${users.bonusBalance} + ${booking.earnedBonuses}`,
          visitsCount: sql`${users.visitsCount} + 1`,
          totalSpent: sql`${users.totalSpent} + ${booking.totalPrice}`,
          spinsAvailable: sql`${users.spinsAvailable} + 1`,
        })
        .where(eq(users.id, booking.userId));

      return { success: true, earnedBonuses: booking.earnedBonuses };
    }),

  allBookings: adminQuery.query(async () => {
    const db = getDb();
    return db.query.bookings.findMany({
      orderBy: [desc(bookings.createdAt)],
      limit: 100,
    });
  }),

  allUsers: adminQuery.query(async () => {
    const db = getDb();
    return db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      limit: 200,
    });
  }),
});
