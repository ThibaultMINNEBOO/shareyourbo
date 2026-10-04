import type { Race } from "../schemas";
import { protoss } from "./protoss";
import { terran } from "./terran";
import { ACTION_NAMES_FR, LEVEL_NAMES_FR } from "./names-fr";
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

export type GameLocale = "en" | "fr";

/** French [name, short] for an action id, including generated upgrade levels. */
function frenchNames(id: string): [string, string] | undefined {
  const direct = ACTION_NAMES_FR[id];
  if (direct) return direct;
  const level = id.match(/^(.+)-(\d)$/);
  const family = level && LEVEL_NAMES_FR[level[1]!];
  return family ? [`${family[0]} niveau ${level[2]}`, `${family[1]}${level[2]}`] : undefined;
}

export function actionName(action: GameAction, locale: GameLocale = "en") {
  return locale === "fr" ? (frenchNames(action.id)?.[0] ?? action.name) : action.name;
}

export function actionShort(action: GameAction, locale: GameLocale = "en") {
  return locale === "fr" ? (frenchNames(action.id)?.[1] ?? action.short) : action.short;
}

/** Lowercase, strip accents and punctuation: "Pylône" → "pylone". */
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+]/g, "");
}

const normalize = normalizeSearch;

type SearchEntry = { names: string[]; words: string[]; terms: string[] };

const searchIndex = new Map<string, SearchEntry>();

function searchEntry(action: GameAction): SearchEntry {
  let entry = searchIndex.get(action.id);
  if (!entry) {
    const fr = frenchNames(action.id);
    const names = [action.name, fr?.[0]].filter((n): n is string => !!n);
    const familyFr = LEVEL_NAMES_FR[action.id.replace(/-\d$/, "")]?.[0];
    const level = action.id.match(/-(\d)$/)?.[1];
    entry = {
      names: names.map(normalize),
      words: names.flatMap((n) => n.split(/[\s'’-]+/)).map(normalize),
      terms: [
        action.short,
        fr?.[1],
        ...(action.aliases ?? []),
        familyFr && level ? `+${level} ${familyFr}` : undefined,
      ]
        .filter((t): t is string => !!t)
        .map(normalize),
    };
    searchIndex.set(action.id, entry);
  }
  return entry;
}

/**
 * Rank a race's actions against a query (English or French names, accents
 * ignored): exact short/alias match first, then name prefix, word prefix, and
 * finally substring.
 */
export function searchActions(race: Race, query: string): GameAction[] {
  const q = normalize(query);
  const actions = ACTIONS_BY_RACE[race];
  if (!q) return actions;
  const scored: { action: GameAction; score: number }[] = [];
  for (const action of actions) {
    const { names, words, terms } = searchEntry(action);
    let score = 0;
    if (terms.includes(q) || names.includes(q)) score = 100;
    else if (names.some((n) => n.startsWith(q))) score = 80;
    else if (words.some((w) => w.startsWith(q))) score = 60;
    else if (terms.some((t) => t.startsWith(q))) score = 50;
    else if (names.some((n) => n.includes(q))) score = 30;
    if (score) scored.push({ action, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.action);
}
