/**
 * Notification Scheduler
 * Runs every minute to check and send:
 * - 24h booking reminders
 * - 1h booking reminders
 * - 2h post-visit review requests
 */

import { getDb } from "./queries/connection";
import { bookings, users } from "../db/schema";
import { eq, and, gte, lte, isNotNull } from "drizzle-orm";
import {
  sendTelegramMessage,
  bookingReminder24h,
  bookingReminder1h,
  reviewRequest,
} from "./telegram-bot";

let isRunning = false;

export function startScheduler() {
  // Run every minute
  setInterval(runScheduledTasks, 60 * 1000);
  // Also run immediately on start
  runScheduledTasks();
  console.log("[Scheduler] Started — checking every 60 seconds");
}

async function runScheduledTasks() {
  if (isRunning) return;
  isRunning = true;

  try {
    await send24hReminders();
    await send1hReminders();
    await sendReviewRequests();
  } catch (err) {
    console.error("[Scheduler] Error:", err);
  } finally {
    isRunning = false;
  }
}

/** Send 24h reminders */
async function send24hReminders() {
  const db = getDb();
  const now = new Date();
  const target = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h from now
  const windowStart = new Date(target.getTime() - 5 * 60 * 1000); // ±5 min
  const windowEnd = new Date(target.getTime() + 5 * 60 * 1000);

  const dateStr = target.toISOString().split("T")[0];

  const pending = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.date, dateStr),
        eq(bookings.reminder24hSent, false),
        isNotNull(bookings.telegramChatId),
        eq(bookings.status, "confirmed")
      )
    );

  for (const booking of pending) {
    if (!booking.telegramChatId) continue;

    const msg = bookingReminder24h({
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      boards: booking.boards,
      totalPrice: booking.totalPrice,
    });

    const result = await sendTelegramMessage(booking.telegramChatId, msg);
    if (result.ok) {
      await db.update(bookings).set({ reminder24hSent: true }).where(eq(bookings.id, booking.id));
      console.log(`[Scheduler] 24h reminder sent for booking #${booking.id}`);
    }
  }
}

/** Send 1h reminders */
async function send1hReminders() {
  const db = getDb();
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  // Find bookings starting in ~1 hour
  const targetHour = currentHour + 1;

  const pending = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.date, today),
        eq(bookings.reminder1hSent, false),
        isNotNull(bookings.telegramChatId),
        eq(bookings.status, "confirmed")
      )
    );

  for (const booking of pending) {
    if (!booking.telegramChatId) continue;

    const [bookingHour] = booking.time.split(":").map(Number);
    // Only send if booking is in ~1 hour (±5 min window)
    if (Math.abs(bookingHour - targetHour) > 0 || currentMin > 5) continue;

    const msg = bookingReminder1h({
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      boards: booking.boards,
      totalPrice: booking.totalPrice,
    });

    const result = await sendTelegramMessage(booking.telegramChatId, msg);
    if (result.ok) {
      await db.update(bookings).set({ reminder1hSent: true }).where(eq(bookings.id, booking.id));
      console.log(`[Scheduler] 1h reminder sent for booking #${booking.id}`);
    }
  }
}

/** Send review requests 2h after confirmed visit */
async function sendReviewRequests() {
  const db = getDb();
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // Find bookings confirmed ~2 hours ago
  const completed = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.reviewSent, false),
        isNotNull(bookings.telegramChatId),
        isNotNull(bookings.confirmedAt),
        eq(bookings.status, "completed")
      )
    );

  for (const booking of completed) {
    if (!booking.telegramChatId || !booking.confirmedAt) continue;

    const confirmedTime = new Date(booking.confirmedAt);
    const timeSinceConfirm = now.getTime() - confirmedTime.getTime();

    // Only send if 2+ hours passed since confirmation
    if (timeSinceConfirm < 2 * 60 * 60 * 1000) continue;

    const msg = reviewRequest(booking.date);

    const result = await sendTelegramMessage(booking.telegramChatId, msg, {
      parse_mode: "HTML",
    });
    if (result.ok) {
      await db.update(bookings).set({ reviewSent: true }).where(eq(bookings.id, booking.id));
      console.log(`[Scheduler] Review request sent for booking #${booking.id}`);
    }
  }
}
