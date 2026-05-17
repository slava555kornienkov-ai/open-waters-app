import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { wheelRewards, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const PRIZES = [
  { id: "discount-5", label: "Скидка 5%", type: "discount" as const, value: 5 },
  { id: "discount-10", label: "Скидка 10%", type: "discount" as const, value: 10 },
  { id: "discount-15", label: "Скидка 15%", type: "discount" as const, value: 15 },
  { id: "bonus-50", label: "50 бонусов", type: "bonus" as const, value: 50 },
  { id: "bonus-100", label: "100 бонусов", type: "bonus" as const, value: 100 },
  { id: "bonus-150", label: "150 бонусов", type: "bonus" as const, value: 150 },
  { id: "bonus-200", label: "200 бонусов", type: "bonus" as const, value: 200 },
  { id: "free-hour", label: "Бесплатный час", type: "free" as const, value: 1 },
];

function spinWheel(): typeof PRIZES[number] {
  return PRIZES[Math.floor(Math.random() * PRIZES.length)];
}

export const wheelRouter = createRouter({
  spin: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.user;

    if (user.spinsAvailable <= 0) {
      throw new Error("Нет доступных вращений");
    }

    const prize = spinWheel();

    // Deduct spin
    await db.update(users)
      .set({ spinsAvailable: user.spinsAvailable - 1 })
      .where(eq(users.id, user.id));

    // Save reward
    await db.insert(wheelRewards).values({
      userId: user.id,
      rewardType: prize.type,
      rewardValue: prize.value,
      label: prize.label,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // If bonus type, add to balance
    if (prize.type === "bonus") {
      await db.update(users)
        .set({ bonusBalance: user.bonusBalance + prize.value })
        .where(eq(users.id, user.id));
    }

    return { prize, spinsLeft: user.spinsAvailable - 1 };
  }),

  prizes: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.wheelRewards.findMany({
      where: eq(wheelRewards.userId, ctx.user.id),
      orderBy: [desc(wheelRewards.createdAt)],
    });
  }),

  usePrize: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(wheelRewards)
        .set({ used: true })
        .where(eq(wheelRewards.id, input.id));
      return { success: true };
    }),
});
