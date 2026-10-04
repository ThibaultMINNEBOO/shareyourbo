import { and, desc, eq, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { builds, users } from "../db/schema";
import type { AppEnv } from "../env";
import { buildSummaryColumns, toBuildSummary } from "./serializers";

export const userRoutes = new Hono<AppEnv>().get("/:username", async (c) => {
  const db = c.get("db");
  const [profile] = await db
    .select({
      id: users.id,
      username: users.username,
      displayUsername: users.displayUsername,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, c.req.param("username").toLowerCase()))
    .limit(1);
  if (!profile?.username) throw new HTTPException(404, { message: "User not found" });

  const isSelf = c.get("user")?.id === profile.id;
  const filters: SQL[] = [eq(builds.authorId, profile.id)];
  if (!isSelf) filters.push(eq(builds.visibility, "public"));

  const rows = await db
    .select({ ...buildSummaryColumns, steps: builds.steps })
    .from(builds)
    .innerJoin(users, eq(users.id, builds.authorId))
    .where(and(...filters))
    .orderBy(desc(builds.updatedAt))
    .limit(100);

  return c.json({
    user: {
      username: profile.username,
      displayUsername: profile.displayUsername ?? profile.username,
      createdAt: profile.createdAt,
    },
    isSelf,
    builds: rows.map(toBuildSummary),
  });
});
