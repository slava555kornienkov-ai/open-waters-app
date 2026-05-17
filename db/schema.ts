import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  boolean,
  date,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  telegramId: varchar("telegramId", { length: 100 }),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  passwordHash: varchar("passwordHash", { length: 255 }),
  visitsCount: int("visitsCount").default(0).notNull(),
  bonusBalance: int("bonusBalance").default(0).notNull(),
  totalSpent: int("totalSpent").default(0).notNull(),
  loyaltyLevel: mysqlEnum("loyaltyLevel", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  referralCode: varchar("referralCode", { length: 20 }).unique(),
  invitedBy: bigint("invitedBy", { mode: "number", unsigned: true }),
  spinsAvailable: int("spinsAvailable").default(0).notNull(),
  role: mysqlEnum("role", ["user", "admin", "employee"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Bookings ────────────────────────────────────────────
export const bookings = mysqlTable("bookings", {
  id: serial("id").primaryKey(),
  bookingNumber: varchar("bookingNumber", { length: 20 }).notNull().unique(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  phone: varchar("phone", { length: 20 }),
  date: date("date").notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  duration: int("duration").notNull(),
  boards: int("boards").default(1).notNull(),
  instructor: boolean("instructor").default(false).notNull(),
  rescuers: boolean("rescuers").default(false).notNull(),
  totalPrice: int("totalPrice").notNull(),
  usedBonuses: int("usedBonuses").default(0).notNull(),
  earnedBonuses: int("earnedBonuses").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "qr", "card", "confirmed", "declined"]).default("pending").notNull(),
  qrCode: varchar("qrCode", { length: 255 }),
  isWeekend: boolean("isWeekend").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ─── Referrals ───────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: serial("id").primaryKey(),
  inviterId: bigint("inviterId", { mode: "number", unsigned: true }).notNull(),
  invitedUserId: bigint("invitedUserId", { mode: "number", unsigned: true }).notNull(),
  referralCode: varchar("referralCode", { length: 20 }).notNull(),
  rewardGranted: boolean("rewardGranted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;

// ─── Subscriptions ───────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  phone: varchar("phone", { length: 20 }),
  name: varchar("name", { length: 255 }),
  hours: int("hours").notNull(),
  price: int("price").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "confirmed", "declined"]).default("pending").notNull(),
  hoursUsed: int("hoursUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;

// ─── Support Messages ────────────────────────────────────
export const supportMessages = mysqlTable("support_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  sender: mysqlEnum("sender", ["user", "admin"]).notNull(),
  text: text("text").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupportMessage = typeof supportMessages.$inferSelect;

// ─── Wheel Rewards ───────────────────────────────────────
export const wheelRewards = mysqlTable("wheel_rewards", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  rewardType: mysqlEnum("rewardType", ["discount", "bonus", "free"]).notNull(),
  rewardValue: int("rewardValue").notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  used: boolean("used").default(false).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WheelReward = typeof wheelRewards.$inferSelect;

// ─── Promotions ──────────────────────────────────────────
export const promotions = mysqlTable("promotions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  image: text("image"),
  activeUntil: date("activeUntil"),
  discount: int("discount"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;

// ─── Notifications ───────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["booking", "payment", "bonus", "promo", "support"]).notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
