// Explicit binding types (instead of wrangler's global `Env`) so the web app
// can import `AppType` without pulling Workers runtime globals.
import type { D1Database } from "@cloudflare/workers-types";

export type Bindings = {
  DB: D1Database;
  WEB_ORIGIN: string;
};

export type AppEnv = { Bindings: Bindings };
