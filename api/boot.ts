import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { getDb } from "./queries/connection";
import { startScheduler } from "./scheduler";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  // Start notification scheduler (24h, 1h reminders + review requests)
  startScheduler();

  // Auto-initialize database tables
  try {
    const db = getDb();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        unionId VARCHAR(255) UNIQUE,
        telegramId VARCHAR(100),
        name VARCHAR(255),
        phone VARCHAR(20) UNIQUE,
        email VARCHAR(320),
        avatar TEXT,
        passwordHash VARCHAR(255),
        referralCode VARCHAR(50),
        bonusBalance INT DEFAULT 0 NOT NULL,
        visitsCount INT DEFAULT 0 NOT NULL,
        totalSpent INT DEFAULT 0 NOT NULL,
        role ENUM('user','employee','admin') DEFAULT 'user' NOT NULL,
        invitedCount INT DEFAULT 0 NOT NULL,
        earnedFromReferrals INT DEFAULT 0 NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        bookingNumber VARCHAR(20) UNIQUE NOT NULL,
        userId BIGINT UNSIGNED NOT NULL,
        phone VARCHAR(20),
        date DATE NOT NULL,
        time VARCHAR(10) NOT NULL,
        duration INT NOT NULL,
        boards INT DEFAULT 1 NOT NULL,
        instructor TINYINT DEFAULT 0 NOT NULL,
        rescuers TINYINT DEFAULT 0 NOT NULL,
        bonusesUsed INT DEFAULT 0 NOT NULL,
        paymentMethod ENUM('qr','card') DEFAULT 'qr' NOT NULL,
        totalPrice INT NOT NULL,
        status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS wheel_prizes (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL,
        prizeId VARCHAR(50) NOT NULL,
        label VARCHAR(255) NOT NULL,
        type ENUM('discount','bonus','free') NOT NULL,
        value INT NOT NULL,
        color VARCHAR(20),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL,
        hours INT NOT NULL,
        usedHours INT DEFAULT 0 NOT NULL,
        status ENUM('active','expired') DEFAULT 'active' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        isRead TINYINT DEFAULT 0 NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("[DB] Tables initialized successfully");
  } catch (err) {
    console.error("[DB] Initialization error:", err);
  }

  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
