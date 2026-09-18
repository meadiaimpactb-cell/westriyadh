import { authRouter } from "./auth-router";
import { platformRouter } from "./platform-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  platform: platformRouter,
});

export type AppRouter = typeof appRouter;
