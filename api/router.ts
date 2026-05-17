import { authRouter } from "./auth-router";
import { profileRouter } from "./profile-router";
import { bookingRouter } from "./booking-router";
import { wheelRouter } from "./wheel-router";
import { promotionsRouter } from "./promotions-router";
import { supportRouter } from "./support-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  profile: profileRouter,
  booking: bookingRouter,
  wheel: wheelRouter,
  promotions: promotionsRouter,
  support: supportRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
