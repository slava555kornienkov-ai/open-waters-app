import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { signSessionToken, verifySessionToken } from "./kimi/session";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "open-waters-salt-2026");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(z.object({
      name: z.string().min(1).max(100),
      phone: z.string().min(10).max(20),
      password: z.string().min(4).max(100),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // Check if user exists
      const existing = await db.select().from(users).where(eq(users.phone, input.phone)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "User with this phone already exists" });
      }

      const passwordHash = await hashPassword(input.password);
      const referralCode = `OW-${input.name.toUpperCase().replace(/\s/g, "-")}-${Math.floor(Math.random() * 90 + 10)}`;

      const result = await db.insert(users).values({
        name: input.name,
        phone: input.phone,
        passwordHash,
        referralCode,
        bonusBalance: 300,
        visitsCount: 0,
        totalSpent: 0,
        role: "user",
        invitedCount: 0,
        earnedFromReferrals: 0,
      });

      const userId = Number(result[0].insertId);
      const token = await signSessionToken({ sub: String(userId), unionId: String(userId), clientId: "local" });

      return { token, name: input.name, phone: input.phone, bonusBalance: 300, referralCode };
    }),

  login: publicQuery
    .input(z.object({
      phone: z.string().min(10).max(20),
      password: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      const found = await db.select().from(users).where(eq(users.phone, input.phone)).limit(1);
      if (found.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const user = found[0];
      const passwordHash = await hashPassword(input.password);
      
      if (user.passwordHash !== passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
      }

      const token = await signSessionToken({ sub: String(user.id), unionId: String(user.id), clientId: "local" });

      return {
        token,
        name: user.name || user.phone,
        phone: user.phone,
        bonusBalance: user.bonusBalance || 0,
        visitsCount: user.visitsCount || 0,
        totalSpent: user.totalSpent || 0,
        referralCode: user.referralCode || "",
      };
    }),

  me: publicQuery
    .query(async ({ ctx }) => {
      const authHeader = ctx.req?.headers?.get?.("authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      
      if (!token) return null;

      try {
        const payload = await verifySessionToken(token);
        if (!payload) return null;
        
        const db = getDb();
        const found = await db.select().from(users).where(eq(users.id, Number(payload.sub || payload.unionId))).limit(1);
        if (found.length === 0) return null;
        
        const user = found[0];
        return {
          id: user.id,
          name: user.name || user.phone,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          bonusBalance: user.bonusBalance || 0,
          visitsCount: user.visitsCount || 0,
          totalSpent: user.totalSpent || 0,
          referralCode: user.referralCode || "",
          role: user.role || "user",
        };
      } catch {
        return null;
      }
    }),
});
