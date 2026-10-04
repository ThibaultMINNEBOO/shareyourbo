import type { Race, Step } from "./schemas";
import { getAction } from "./sc2";

export const START_SUPPLY = 12;
export const MAX_SUPPLY = 200;
/** Main base supply cap at 0:00 (Hatchery 6 + Overlord 8 for Zerg). */
export const START_CAP: Record<Race, number> = { T: 15, P: 15, Z: 14 };

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Lenient game-time parser: "1:30", "1.30", "130" (→ 1:30) and "45" (→ 0:45).
 * Returns seconds, or null if the input isn't a valid time.
 */
export function parseTime(input: string): number | null {
  const value = input.trim();
  let minutes: number;
  let seconds: number;
  const parts = value.match(/^(\d{1,2})[:.](\d{2})$/);
  if (parts) {
    minutes = Number(parts[1]);
    seconds = Number(parts[2]);
  } else if (/^\d{1,4}$/.test(value)) {
    const digits = Number(value);
    if (value.length <= 2) return digits;
    minutes = Math.floor(digits / 100);
    seconds = digits % 100;
  } else {
    return null;
  }
  if (seconds >= 60) return null;
  return minutes * 60 + seconds;
}

export type SupplyInfo = {
  /** Supply at the moment the step starts (explicit value or suggestion). */
  supply: number;
  /** Supply cap available at that moment (assumes earlier providers finished). */
  cap: number;
  /** True when the step was given an explicit supply by the author. */
  overridden: boolean;
  /** True when the step would exceed the supply cap. */
  blocked: boolean;
};

/**
 * Walk the build and suggest the supply count for each step. An explicit
 * supply on a step resyncs the running count, so manual fixes propagate.
 */
export function computeSupply(race: Race, steps: Step[]): SupplyInfo[] {
  let used = START_SUPPLY;
  let cap = START_CAP[race];
  return steps.map((step) => {
    const overridden = step.kind === "step" && step.supply !== undefined;
    if (overridden) used = step.supply!;
    const action = step.kind === "step" ? getAction(step.actionId) : undefined;
    const delta = (action?.supply ?? 0) * step.count;
    const info: SupplyInfo = { supply: used, cap, overridden, blocked: delta > 0 && used + delta > cap };
    used = Math.max(0, used + delta);
    cap = Math.min(MAX_SUPPLY, cap + (action?.supplyCap ?? 0) * step.count);
    return info;
  });
}

export function stepLabel(step: Step) {
  const name = getAction(step.actionId)?.name ?? step.label ?? "";
  return step.count > 1 ? `${name} x${step.count}` : name;
}

/** Plain-text export, e.g. for pasting into a notepad or Discord. */
export function stepsToText(steps: Step[]) {
  return steps
    .map((step) => {
      if (step.kind === "section") return `# ${step.label}`;
      const supply = (step.supply?.toString() ?? "").padEnd(4);
      const time = (step.time !== undefined ? formatTime(step.time) : "").padEnd(6);
      const note = step.note ? ` — ${step.note}` : "";
      return `${supply}${time}${stepLabel(step)}${note}`;
    })
    .join("\n");
}

export function slugify(title: string) {
  const slug = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "build";
}
