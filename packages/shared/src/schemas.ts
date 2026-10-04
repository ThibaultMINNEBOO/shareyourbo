import { z } from "zod";

export const RACES = ["T", "Z", "P"] as const;
export const OPPONENT_RACES = ["T", "Z", "P", "R"] as const;
export const BUILD_TAGS = [
  "macro",
  "timing",
  "all-in",
  "cheese",
  "proxy",
  "defensive",
  "greedy",
  "beginner",
] as const;
export const VISIBILITIES = ["public", "unlisted", "private"] as const;

export type Race = (typeof RACES)[number];
export type OpponentRace = (typeof OPPONENT_RACES)[number];
export type BuildTag = (typeof BUILD_TAGS)[number];
export type Visibility = (typeof VISIBILITIES)[number];

export const RACE_NAMES: Record<OpponentRace, string> = {
  T: "Terran",
  Z: "Zerg",
  P: "Protoss",
  R: "Random",
};

export const raceSchema = z.enum(RACES);
export const opponentRaceSchema = z.enum(OPPONENT_RACES);

export const MAX_STEPS = 300;

export const stepSchema = z
  .object({
    id: z.string().min(1).max(32),
    /** "section" rows are headings (label = title) that group the steps below them. */
    kind: z.enum(["step", "section"]),
    supply: z.number().int().min(0).max(200).optional(),
    /** Game time in seconds (LotV real-time clock). */
    time: z.number().int().min(0).max(3600).optional(),
    /** Reference into the SC2 game data (e.g. "zergling"); absent for free-text steps. */
    actionId: z.string().max(64).optional(),
    /** Free text action, or section title. */
    label: z.string().trim().max(80).optional(),
    count: z.number().int().min(1).max(50),
    note: z.string().trim().max(280).optional(),
  })
  .refine((s) => (s.kind === "section" ? !!s.label : !!(s.actionId || s.label)), {
    message: "A step needs an action or a label",
  });

export type Step = z.infer<typeof stepSchema>;

export const buildInputSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().max(2000).default(""),
  race: raceSchema,
  vsRace: opponentRaceSchema,
  tags: z
    .array(z.enum(BUILD_TAGS))
    .max(4)
    .refine((t) => new Set(t).size === t.length, "Duplicate tags")
    .default([]),
  patch: z.string().trim().max(16).optional(),
  steps: z.array(stepSchema).min(1).max(MAX_STEPS),
  visibility: z.enum(VISIBILITIES).default("public"),
});

export type BuildInput = z.input<typeof buildInputSchema>;
export type BuildData = z.output<typeof buildInputSchema>;

export const buildListQuerySchema = z.object({
  race: raceSchema.optional(),
  vs: opponentRaceSchema.optional(),
  tag: z.enum(BUILD_TAGS).optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(["new", "top"]).default("new"),
  cursor: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(24),
});

export type BuildListQuery = z.input<typeof buildListQuerySchema>;

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/;

export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(USERNAME_PATTERN, "3–24 letters, digits or underscores"),
  email: z.email(),
  password: z.string().min(8, "At least 8 characters").max(128),
});

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Required"),
});
