import type { BuildTag, OpponentRace, Race, Step, Visibility } from "@sybo/shared";
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });

const createdAt = () =>
  timestamp("created_at")
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`);

const updatedAt = () =>
  timestamp("updated_at")
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`)
    .$onUpdate(() => new Date());

// --- Better Auth tables (fields must match better-auth's core schema + username plugin) ---

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  /** Normalized (lowercase) handle used in profile URLs. */
  username: text("username").unique(),
  /** Handle as typed by the user, for display. */
  displayUsername: text("display_username"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    /** Provider-side account id; equals the user id for the "credential" provider. */
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    /** Password hash for email/password accounts. */
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)],
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
);

// --- App tables ---

export const builds = sqliteTable(
  "builds",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid(12)),
    /** URL slug, e.g. "pvz-2-base-blink-k3f9a2". Unique and stable after creation. */
    slug: text("slug").notNull().unique(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    race: text("race").$type<Race>().notNull(),
    vsRace: text("vs_race").$type<OpponentRace>().notNull(),
    tags: text("tags", { mode: "json" }).$type<BuildTag[]>().notNull().default([]),
    patch: text("patch"),
    /** Ordered build steps; stored inline since they are always read and written as a whole. */
    steps: text("steps", { mode: "json" }).$type<Step[]>().notNull(),
    visibility: text("visibility").$type<Visibility>().notNull().default("public"),
    /** Denormalized count of rows in build_likes, kept in sync on like/unlike. */
    likesCount: integer("likes_count").notNull().default(0),
    views: integer("views").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("builds_matchup_idx").on(t.race, t.vsRace),
    index("builds_author_id_idx").on(t.authorId),
    index("builds_created_at_idx").on(t.createdAt),
    index("builds_likes_count_idx").on(t.likesCount),
  ],
);

export const buildLikes = sqliteTable(
  "build_likes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    buildId: text("build_id")
      .notNull()
      .references(() => builds.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("build_likes_build_id_user_id_unique").on(t.buildId, t.userId),
    index("build_likes_user_id_idx").on(t.userId),
  ],
);

export type BuildRow = typeof builds.$inferSelect;
export type NewBuildRow = typeof builds.$inferInsert;
export type UserRow = typeof users.$inferSelect;
