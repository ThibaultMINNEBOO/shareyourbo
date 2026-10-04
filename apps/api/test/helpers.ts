import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { env } from "cloudflare:workers";
import type { BuildInput } from "@sybo/shared";
import app from "../src/index";
import type { Bindings } from "../src/env";

const ORIGIN = "http://localhost:5173";

export async function request(path: string, init: RequestInit & { cookie?: string } = {}) {
  const headers = new Headers(init.headers);
  headers.set("Origin", ORIGIN);
  if (init.cookie) headers.set("Cookie", init.cookie);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const ctx = createExecutionContext();
  const res = await app.request(`http://localhost${path}`, { ...init, headers }, env as unknown as Bindings, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

let userCount = 0;

/** Signs up a fresh user and returns their session cookie. */
export async function signUp(username = `user_${++userCount}_${Date.now() % 100000}`) {
  const res = await request("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify({ email: `${username}@example.test`, password: "testpass123", name: username, username }),
  });
  if (!res.ok) throw new Error(`sign-up failed: ${res.status} ${await res.text()}`);
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  return { cookie, username: username.toLowerCase() };
}

export const sampleBuild = (overrides: Partial<BuildInput> = {}): BuildInput => ({
  title: "PvZ Stargate Opener",
  race: "P",
  vsRace: "Z",
  tags: ["macro"],
  steps: [
    { id: "1", kind: "step", count: 1, actionId: "pylon", supply: 14, time: 18 },
    { id: "2", kind: "step", count: 1, actionId: "gateway", supply: 16 },
  ],
  ...overrides,
});

export async function createBuild(cookie: string, overrides: Partial<BuildInput> = {}) {
  const res = await request("/api/builds", { method: "POST", cookie, body: JSON.stringify(sampleBuild(overrides)) });
  if (res.status !== 201) throw new Error(`create failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { id: string; slug: string };
}
