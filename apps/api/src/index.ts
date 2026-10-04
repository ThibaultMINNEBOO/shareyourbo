import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { createAuth } from "./auth";
import type { AppEnv } from "./env";
import { context } from "./middleware/context";
import { buildRoutes } from "./routes/builds";
import { userRoutes } from "./routes/users";

const app = new Hono<AppEnv>().basePath("/api");

app.use(logger());
app.use("*", async (c, next) =>
  cors({ origin: c.env.WEB_ORIGIN, credentials: true })(c, next),
);

app.on(["GET", "POST"], "/auth/*", (c) => createAuth(c.env).handler(c.req.raw));

app.use("*", context);

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

const routes = app
  .get("/health", (c) => c.json({ ok: true }))
  .get("/me", (c) => c.json({ user: c.get("user") }))
  .route("/builds", buildRoutes)
  .route("/users", userRoutes);

export type AppType = typeof routes;
export default app;
