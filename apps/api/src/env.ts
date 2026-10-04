// Explicit binding types (instead of wrangler's global `Env`) so the web app
// can import `AppType` without pulling Workers runtime globals.
import type { D1Database } from "@cloudflare/workers-types";
import type { Auth, SessionUser } from "./auth";
import type { Db } from "./db";

export type Bindings = {
  DB: D1Database;
  WEB_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
};

export type Variables = {
  db: Db;
  auth: Auth;
  user: SessionUser | null;
};

export type AppEnv = { Bindings: Bindings; Variables: Variables };
