import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { USERNAME_PATTERN } from "@sybo/shared";
import { createDb, schema } from "./db";
import type { Bindings } from "./env";
import { hashPassword, verifyPassword } from "./lib/password";

export function createAuth(env: Bindings) {
  return betterAuth({
    // Public origin (the web app proxies /api to this Worker), so cookies and
    // origin checks are first-party from the browser's point of view.
    baseURL: env.WEB_ORIGIN,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.WEB_ORIGIN],
    database: drizzleAdapter(createDb(env.DB), {
      provider: "sqlite",
      usePlural: true,
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
      password: { hash: hashPassword, verify: verifyPassword },
    },
    plugins: [
      username({
        minUsernameLength: 3,
        maxUsernameLength: 24,
        usernameValidator: (value) => USERNAME_PATTERN.test(value),
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type SessionUser = Auth["$Infer"]["Session"]["user"];
