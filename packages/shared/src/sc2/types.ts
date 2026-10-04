import type { Race } from "../schemas";

export type ActionKind = "unit" | "building" | "upgrade" | "ability";

export type GameAction = {
  /** Stable kebab-case id stored in build steps, e.g. "spawning-pool". */
  id: string;
  name: string;
  /** 2–4 letter label for compact badges, e.g. "Pool". */
  short: string;
  race: Race;
  kind: ActionKind;
  minerals: number;
  gas: number;
  /** Build/research time in game seconds (approximate, informational). */
  time: number;
  /**
   * Net change in used supply when this step happens: +1 for a worker,
   * -1 for a Zerg building (the drone is consumed), +1 for Roach→Ravager…
   */
  supply: number;
  /** Supply cap this provides once finished (Pylon 8, Hatchery 6…). */
  supplyCap?: number;
  /** Extra search terms (community abbreviations). */
  aliases?: string[];
};
