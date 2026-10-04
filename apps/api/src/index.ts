import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono<{ Bindings: CloudflareBindings }>().basePath("/api");

app.use(logger());
app.use("*", async (c, next) =>
  cors({ origin: c.env.WEB_ORIGIN, credentials: true })(c, next),
);

const routes = app.get("/health", (c) => c.json({ ok: true }));

export type AppType = typeof routes;
export default app;
