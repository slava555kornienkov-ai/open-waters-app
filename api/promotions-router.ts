import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { promotions } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const promotionsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.query.promotions.findMany({
      where: eq(promotions.isActive, true),
      orderBy: [promotions.createdAt],
    });
  }),

  applyCode: authedQuery
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      void ctx;
      const promo = await db.query.promotions.findFirst({
        where: and(
          eq(promotions.isActive, true),
        ),
      });
      if (!promo) {
        throw new Error("Промокод не найден или истек");
      }
      return { promo, discount: promo.discount ?? 0, code: input.code };
    }),
});
