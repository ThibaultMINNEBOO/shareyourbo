declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    WEB_ORIGIN: string;
    BETTER_AUTH_SECRET: string;
    TEST_MIGRATIONS: import("cloudflare:test").D1Migration[];
  }
}
