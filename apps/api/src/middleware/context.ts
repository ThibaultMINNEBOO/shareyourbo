import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { createAuth } from "../auth";
import { createDb } from "../db";
import type { AppEnv } from "../env";

/** Attaches db, auth and the current session user (or null) to the context. */
export const context = createMiddleware<AppEnv>(async (c, next) => {
  const auth = createAuth(c.env);
  c.set("db", createDb(c.env.DB));
  c.set("auth", auth);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  await next();
});

export const requireUser = createMiddleware<
  AppEnv & { Variables: { user: NonNullable<AppEnv["Variables"]["user"]> } }
>(async (c, next) => {
  if (!c.get("user")) throw new HTTPException(401, { message: "Sign in required" });
  await next();
});
