// Explicit binding types (instead of wrangler's global `Env`) so the web app
// can import `AppType` without pulling Workers runtime globals.
export type Bindings = {
  WEB_ORIGIN: string;
};

export type AppEnv = { Bindings: Bindings };
