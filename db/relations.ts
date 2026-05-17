import { relations } from "drizzle-orm";
import { users, bookings, referrals } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  referralsSent: many(referrals, { relationName: "inviter" }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  inviter: one(users, { fields: [referrals.inviterId], references: [users.id], relationName: "inviter" }),
}));
