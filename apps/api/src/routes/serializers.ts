import type { Step } from "@sybo/shared";
import { builds, users } from "../db/schema";

/** Columns shared by list and detail responses. */
export const buildSummaryColumns = {
  id: builds.id,
  slug: builds.slug,
  title: builds.title,
  race: builds.race,
  vsRace: builds.vsRace,
  tags: builds.tags,
  patch: builds.patch,
  visibility: builds.visibility,
  likesCount: builds.likesCount,
  views: builds.views,
  createdAt: builds.createdAt,
  updatedAt: builds.updatedAt,
  authorId: builds.authorId,
  authorUsername: users.username,
  authorDisplayUsername: users.displayUsername,
};

const PREVIEW_STEPS = 6;

/** First few concrete steps, used as the "opener" preview on cards. */
export function previewSteps(steps: Step[]) {
  return steps.filter((s) => s.kind === "step").slice(0, PREVIEW_STEPS);
}

type SummaryRow = {
  steps: Step[];
  authorId: string;
  authorUsername: string | null;
  authorDisplayUsername: string | null;
};

/** Card-sized build: no description, steps trimmed to a preview. */
export function toBuildSummary<R extends SummaryRow>(row: R) {
  const { steps, authorUsername, authorDisplayUsername, authorId: _, ...rest } = row;
  return {
    ...rest,
    author: author({ authorUsername, authorDisplayUsername }),
    stepCount: steps.filter((s) => s.kind === "step").length,
    preview: previewSteps(steps),
  };
}

export function author(row: { authorUsername: string | null; authorDisplayUsername: string | null }) {
  return {
    username: row.authorUsername ?? "unknown",
    displayUsername: row.authorDisplayUsername ?? row.authorUsername ?? "unknown",
  };
}
