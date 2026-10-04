import type { Race } from "../schemas";
import { protoss } from "./protoss";
import { terran } from "./terran";
import type { ActionKind, GameAction } from "./types";
import { zerg } from "./zerg";

export type { ActionKind, GameAction } from "./types";

export const ACTIONS_BY_RACE: Record<Race, GameAction[]> = { T: terran, Z: zerg, P: protoss };

export const ALL_ACTIONS: GameAction[] = [...terran, ...zerg, ...protoss];

const byId = new Map(ALL_ACTIONS.map((a) => [a.id, a]));

export function getAction(id: string | undefined): GameAction | undefined {
  return id ? byId.get(id) : undefined;
}

export const ACTION_KIND_LABELS: Record<ActionKind, string> = {
  unit: "Units",
  building: "Buildings",
  upgrade: "Upgrades",
  ability: "Abilities",
};

export const WORKER_ID: Record<Race, string> = { T: "scv", Z: "drone", P: "probe" };

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+]/g, "");
}

/**
 * Rank a race's actions against a query: exact short/alias match first, then
 * name prefix, word prefix, and finally substring.
 */
export function searchActions(race: Race, query: string): GameAction[] {
  const q = normalize(query);
  const actions = ACTIONS_BY_RACE[race];
  if (!q) return actions;
  const scored: { action: GameAction; score: number }[] = [];
  for (const action of actions) {
    const name = normalize(action.name);
    const terms = [action.short, ...(action.aliases ?? [])].map(normalize);
    let score = 0;
    if (terms.includes(q) || name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (action.name.toLowerCase().split(/[\s-]+/).some((w) => normalize(w).startsWith(q))) score = 60;
    else if (terms.some((t) => t.startsWith(q))) score = 50;
    else if (name.includes(q)) score = 30;
    if (score) scored.push({ action, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.action);
}
