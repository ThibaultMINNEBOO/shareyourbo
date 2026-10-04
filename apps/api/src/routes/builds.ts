import {
  type BuildData,
  buildInputSchema,
  buildListQuerySchema,
  slugify,
} from "@sybo/shared";
import { and, desc, eq, lt, or, sql, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { nanoid, customAlphabet } from "nanoid";
import { buildLikes, builds, users } from "../db/schema";
import type { AppEnv } from "../env";
import { decodeCursor, encodeCursor } from "../lib/cursor";
import { validator } from "../lib/validator";
import { requireUser } from "../middleware/context";
import { author, buildSummaryColumns, toBuildSummary } from "./serializers";

const slugSuffix = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

/** Counter updates must not bump updated_at (its $onUpdate default). */
const keepUpdatedAt = { updatedAt: sql`${builds.updatedAt}` };

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export const buildRoutes = new Hono<AppEnv>()
  .get("/", validator("query", buildListQuerySchema), async (c) => {
    const { race, vs, tag, q, sort, cursor, limit } = c.req.valid("query");
    const db = c.get("db");

    const filters: (SQL | undefined)[] = [eq(builds.visibility, "public")];
    if (race) filters.push(eq(builds.race, race));
    if (vs) filters.push(eq(builds.vsRace, vs));
    if (tag) filters.push(sql`exists (select 1 from json_each(${builds.tags}) where value = ${tag})`);
    if (q) filters.push(sql`${builds.title} like ${`%${escapeLike(q)}%`} escape '\\'`);

    const after = decodeCursor(cursor);
    if (after) {
      if (sort === "top") {
        const [likes, created, id] = after as [number, number, string];
        filters.push(
          or(
            lt(builds.likesCount, likes),
            and(eq(builds.likesCount, likes), lt(builds.createdAt, new Date(created))),
            and(eq(builds.likesCount, likes), eq(builds.createdAt, new Date(created)), lt(builds.id, id)),
          ),
        );
      } else {
        const [created, id] = after as [number, string];
        filters.push(
          or(
            lt(builds.createdAt, new Date(created)),
            and(eq(builds.createdAt, new Date(created)), lt(builds.id, id)),
          ),
        );
      }
    }

    const order =
      sort === "top"
        ? [desc(builds.likesCount), desc(builds.createdAt), desc(builds.id)]
        : [desc(builds.createdAt), desc(builds.id)];

    const rows = await db
      .select({ ...buildSummaryColumns, steps: builds.steps })
      .from(builds)
      .innerJoin(users, eq(users.id, builds.authorId))
      .where(and(...filters))
      .orderBy(...order)
      .limit(limit + 1);

    const page = rows.slice(0, limit);
    const last = page.at(-1);
    const nextCursor =
      rows.length > limit && last
        ? encodeCursor(
            sort === "top"
              ? [last.likesCount, last.createdAt.getTime(), last.id]
              : [last.createdAt.getTime(), last.id],
          )
        : null;

    return c.json({
      items: page.map(toBuildSummary),
      nextCursor,
    });
  })

  .get("/:slug", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const [row] = await db
      .select({ ...buildSummaryColumns, description: builds.description, steps: builds.steps })
      .from(builds)
      .innerJoin(users, eq(users.id, builds.authorId))
      .where(eq(builds.slug, c.req.param("slug")))
      .limit(1);

    const isOwner = !!user && row?.authorId === user.id;
    if (!row || (row.visibility === "private" && !isOwner)) {
      throw new HTTPException(404, { message: "Build not found" });
    }

    const [like] = user
      ? await db
          .select({ id: buildLikes.id })
          .from(buildLikes)
          .where(and(eq(buildLikes.buildId, row.id), eq(buildLikes.userId, user.id)))
          .limit(1)
      : [];

    if (!isOwner) {
      c.executionCtx.waitUntil(
        db.update(builds).set({ views: sql`${builds.views} + 1`, ...keepUpdatedAt }).where(eq(builds.id, row.id)).then(() => {}),
      );
    }

    const { authorUsername, authorDisplayUsername, authorId: _, ...build } = row;
    return c.json({
      build: { ...build, author: author({ authorUsername, authorDisplayUsername }) },
      likedByMe: !!like,
      isOwner,
    });
  })

  .post("/", requireUser, validator("json", buildInputSchema), async (c) => {
    const data: BuildData = c.req.valid("json");
    const id = nanoid(12);
    const slug = `${slugify(data.title)}-${slugSuffix()}`;
    await c
      .get("db")
      .insert(builds)
      .values({ ...data, id, slug, authorId: c.get("user").id });
    return c.json({ id, slug }, 201);
  })

  .patch("/:id", requireUser, validator("json", buildInputSchema), async (c) => {
    const db = c.get("db");
    const [build] = await db
      .select({ authorId: builds.authorId, slug: builds.slug })
      .from(builds)
      .where(eq(builds.id, c.req.param("id")))
      .limit(1);
    if (!build) throw new HTTPException(404, { message: "Build not found" });
    if (build.authorId !== c.get("user").id) throw new HTTPException(403, { message: "Not your build" });

    await db.update(builds).set(c.req.valid("json")).where(eq(builds.id, c.req.param("id")));
    return c.json({ id: c.req.param("id"), slug: build.slug });
  })

  .delete("/:id", requireUser, async (c) => {
    const db = c.get("db");
    const [build] = await db
      .select({ authorId: builds.authorId })
      .from(builds)
      .where(eq(builds.id, c.req.param("id")))
      .limit(1);
    if (!build) throw new HTTPException(404, { message: "Build not found" });
    if (build.authorId !== c.get("user").id) throw new HTTPException(403, { message: "Not your build" });

    await db.delete(builds).where(eq(builds.id, c.req.param("id")));
    return c.json({ ok: true });
  })

  .post("/:id/like", requireUser, async (c) => {
    const db = c.get("db");
    const buildId = c.req.param("id");
    const [build] = await db.select({ id: builds.id }).from(builds).where(eq(builds.id, buildId)).limit(1);
    if (!build) throw new HTTPException(404, { message: "Build not found" });

    const inserted = await db
      .insert(buildLikes)
      .values({ buildId, userId: c.get("user").id })
      .onConflictDoNothing()
      .returning({ id: buildLikes.id });
    if (inserted.length) {
      await db
        .update(builds)
        .set({ likesCount: sql`${builds.likesCount} + 1`, ...keepUpdatedAt })
        .where(eq(builds.id, buildId));
    }
    return c.json({ liked: true });
  })

  .delete("/:id/like", requireUser, async (c) => {
    const db = c.get("db");
    const buildId = c.req.param("id");
    const removed = await db
      .delete(buildLikes)
      .where(and(eq(buildLikes.buildId, buildId), eq(buildLikes.userId, c.get("user").id)))
      .returning({ id: buildLikes.id });
    if (removed.length) {
      await db
        .update(builds)
        .set({ likesCount: sql`max(${builds.likesCount} - 1, 0)`, ...keepUpdatedAt })
        .where(eq(builds.id, buildId));
    }
    return c.json({ liked: false });
  });
