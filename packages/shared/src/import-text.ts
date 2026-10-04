import { parseTime } from "./build-math";
import { ALL_ACTIONS, type GameAction, actionName, normalizeSearch } from "./sc2";
import type { Race, Step } from "./schemas";

export type ImportedStep = Omit<Step, "id">;

export type ImportResult = {
  steps: ImportedStep[];
  /** Race most matched actions belong to. */
  race?: Race;
  /** Steps that could not be matched to a known action (kept as text). */
  unmatched: number;
};

const normalize = normalizeSearch;

function buildIndex() {
  const index = new Map<string, GameAction[]>();
  const add = (key: string, action: GameAction) => {
    const k = normalize(key);
    if (!k) return;
    const list = index.get(k) ?? [];
    if (!list.includes(action)) list.push(action);
    index.set(k, list);
  };
  for (const action of ALL_ACTIONS) {
    add(action.name, action);
    add(actionName(action, "fr"), action);
    add(action.id, action);
    for (const alias of action.aliases ?? []) add(alias, action);
  }
  return index;
}

const INDEX = buildIndex();

function findAction(text: string, race?: Race): GameAction | undefined {
  const key = normalize(text);
  const candidates = INDEX.get(key) ?? (key.endsWith("s") ? INDEX.get(key.slice(0, -1)) : undefined);
  if (!candidates?.length) return undefined;
  return candidates.find((a) => a.race === race) ?? candidates[0];
}

/** "Queen x2", "2 Probe", "Chrono Boost (on nexus)" → name, count and note. */
function parseActionPart(part: string) {
  let text = part.trim();
  let note: string | undefined;
  const paren = text.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (paren) {
    text = paren[1]!;
    note = paren[2]!.trim() || undefined;
  }
  let count = 1;
  const suffix = text.match(/^(.+?)\s*[x×]\s*(\d{1,2})$/i);
  const prefix = text.match(/^(\d{1,2})\s*[x×]?\s+(.+)$/i);
  if (suffix) {
    text = suffix[1]!;
    count = Number(suffix[2]);
  } else if (prefix) {
    count = Number(prefix[1]);
    text = prefix[2]!;
  }
  return { text: text.trim(), count: Math.max(1, Math.min(50, count)), note };
}

/**
 * Parse a pasted build order (Spawning Tool export, Liquipedia-style or
 * free-form "14 Pylon" lines, English or French names) into steps. Unknown
 * actions become text steps.
 */
export function parseBuildText(input: string, preferredRace?: Race): ImportResult {
  const steps: ImportedStep[] = [];
  const raceVotes: Record<Race, number> = { T: 0, Z: 0, P: 0 };
  let unmatched = 0;

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("#")) {
      const label = line.replace(/^#+\s*/, "").slice(0, 80);
      if (label) steps.push({ kind: "section", count: 1, label });
      continue;
    }

    // Leading supply and time, separated by tabs, spaces or dashes.
    let rest = line;
    let supply: number | undefined;
    let time: number | undefined;
    // A leading number below 10 ("2 Probe") is a count, not a supply: builds start at 12.
    const supplyMatch = rest.match(/^(\d{1,3})(?:\s*[-–|]\s*|\s+)(?=\S)/);
    if (supplyMatch && Number(supplyMatch[1]) >= 10) {
      supply = Number(supplyMatch[1]);
      rest = rest.slice(supplyMatch[0].length);
    }
    const timeMatch = rest.match(/^(\d{1,2}:\d{2})(?:\s*[-–|]\s*|\s+)(?=\S)/);
    if (timeMatch) {
      time = parseTime(timeMatch[1]!) ?? undefined;
      rest = rest.slice(timeMatch[0].length);
    }

    rest.split(/\s*,\s*/).forEach((part, i) => {
      if (!part) return;
      const { text, count, note } = parseActionPart(part);
      const action = findAction(text, preferredRace);
      const step: ImportedStep = {
        kind: "step",
        count,
        ...(i === 0 && supply !== undefined ? { supply } : {}),
        ...(i === 0 && time !== undefined ? { time } : {}),
        ...(action ? { actionId: action.id } : { label: text.slice(0, 80) }),
        ...(note ? { note: note.slice(0, 280) } : {}),
      };
      if (action) raceVotes[action.race]++;
      else unmatched++;
      steps.push(step);
    });
  }

  const [topRace, votes] = (Object.entries(raceVotes) as [Race, number][]).sort((a, b) => b[1] - a[1])[0]!;
  return { steps, race: votes > 0 ? topRace : undefined, unmatched };
}
