import { describe, expect, it } from "vitest";
import { RACES } from "../schemas";
import { ACTION_NAMES_FR, LEVEL_NAMES_FR } from "./names-fr";
import { ACTIONS_BY_RACE, ALL_ACTIONS, WORKER_ID, actionName, actionShort, getAction, searchActions } from "./index";

describe("sc2 game data", () => {
  it("has unique kebab-case ids", () => {
    const ids = ALL_ACTIONS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("defines a 1-supply worker for every race", () => {
    for (const race of RACES) {
      const worker = getAction(WORKER_ID[race]);
      expect(worker?.race).toBe(race);
      expect(worker?.supply).toBe(1);
    }
  });

  it("has the expected supply providers", () => {
    expect(getAction("pylon")?.supplyCap).toBe(8);
    expect(getAction("supply-depot")?.supplyCap).toBe(8);
    expect(getAction("overlord")?.supplyCap).toBe(8);
    expect(getAction("hatchery")?.supplyCap).toBe(6);
    expect(getAction("nexus")?.supplyCap).toBe(15);
  });

  it("consumes a drone for zerg structures built by drones", () => {
    expect(getAction("spawning-pool")?.supply).toBe(-1);
    expect(getAction("lair")?.supply).toBe(0);
  });

  it("keeps short labels compact", () => {
    for (const race of RACES) for (const a of ACTIONS_BY_RACE[race]) expect(a.short.length).toBeLessThanOrEqual(4);
  });
});

describe("searchActions", () => {
  it("matches community abbreviations first", () => {
    expect(searchActions("T", "rax")[0]?.id).toBe("barracks");
    expect(searchActions("Z", "pool")[0]?.id).toBe("spawning-pool");
    expect(searchActions("P", "wg")[0]?.id).toBe("warp-gate");
  });

  it("matches name prefixes", () => {
    expect(searchActions("Z", "zerg")[0]?.id).toBe("zergling");
    expect(searchActions("P", "cyb")[0]?.id).toBe("cybernetics-core");
  });

  it("matches upgrade levels", () => {
    expect(searchActions("T", "+1 infantry weapons")[0]?.id).toBe("infantry-weapons-1");
  });

  it("returns every action for an empty query", () => {
    expect(searchActions("P", "")).toHaveLength(ACTIONS_BY_RACE.P.length);
  });
});

describe("french names", () => {
  it("translates every action", () => {
    const missing = ALL_ACTIONS.filter((a) => !ACTION_NAMES_FR[a.id] && !LEVEL_NAMES_FR[a.id.replace(/-\d$/, "")]);
    expect(missing.map((a) => a.id)).toEqual([]);
  });

  it("uses the official client names", () => {
    expect(actionName(getAction("pylon")!, "fr")).toBe("Pylône");
    expect(actionName(getAction("hellion")!, "fr")).toBe("Tourmenteur");
    expect(actionName(getAction("spawning-pool")!, "fr")).toBe("Bassin génétique");
    expect(actionName(getAction("infantry-weapons-2")!, "fr")).toBe("Armes d'infanterie niveau 2");
    expect(actionShort(getAction("infantry-weapons-2")!, "fr")).toBe("AI2");
  });

  it("keeps french badge labels compact and unique per race", () => {
    for (const race of RACES) {
      const shorts = ACTIONS_BY_RACE[race].map((a) => actionShort(a, "fr"));
      for (const short of shorts) expect(short.length).toBeLessThanOrEqual(4);
      expect(new Set(shorts).size).toBe(shorts.length);
    }
  });

  it("finds actions by french name, ignoring accents", () => {
    expect(searchActions("P", "pylone")[0]?.id).toBe("pylon");
    expect(searchActions("T", "caserne")[0]?.id).toBe("barracks");
    expect(searchActions("Z", "bassin")[0]?.id).toBe("spawning-pool");
    expect(searchActions("Z", "chancre")[0]?.id).toBe("baneling");
    expect(searchActions("T", "+1 armes d'infanterie")[0]?.id).toBe("infantry-weapons-1");
  });
});
