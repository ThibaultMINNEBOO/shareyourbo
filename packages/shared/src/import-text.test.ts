import { describe, expect, it } from "vitest";
import { parseBuildText } from "./import-text";

const SPAWNING_TOOL = `
  13	  0:12	  Overlord
  16	  0:48	  Hatchery
  18	  1:01	  Extractor
  17	  1:08	  Spawning Pool
  19	  1:42	  Queen x2
  19	  1:45	  Zergling x2, Metabolic Boost
`;

describe("parseBuildText", () => {
  it("parses spawning tool's tab-separated export", () => {
    const { steps, race } = parseBuildText(SPAWNING_TOOL);
    expect(race).toBe("Z");
    expect(steps.map((s) => [s.supply, s.time, s.actionId, s.count])).toEqual([
      [13, 12, "overlord", 1],
      [16, 48, "hatchery", 1],
      [18, 61, "extractor", 1],
      [17, 68, "spawning-pool", 1],
      [19, 102, "queen", 2],
      [19, 105, "zergling", 2],
      [undefined, undefined, "metabolic-boost", 1],
    ]);
  });

  it("accepts loose formats", () => {
    const { steps } = parseBuildText("14 - 0:18 - Pylon\n16 Gateway\nChrono Boost (on nexus)\n2 Probe");
    expect(steps.map((s) => [s.supply, s.time, s.actionId, s.count, s.note])).toEqual([
      [14, 18, "pylon", 1, undefined],
      [16, undefined, "gateway", 1, undefined],
      [undefined, undefined, "chrono-boost", 1, "on nexus"],
      [undefined, undefined, "probe", 2, undefined],
    ]);
  });

  it("keeps unknown actions as text steps and counts them", () => {
    const { steps, unmatched } = parseBuildText("20 Scout with probe\n21 Pylon");
    expect(steps[0]).toMatchObject({ supply: 20, label: "Scout with probe" });
    expect(steps[0]).not.toHaveProperty("actionId");
    expect(unmatched).toBe(1);
  });

  it("turns markdown headings into sections", () => {
    const { steps } = parseBuildText("# Opening\n14 Pylon");
    expect(steps[0]).toMatchObject({ kind: "section", label: "Opening" });
  });

  it("prefers the requested race when names collide", () => {
    expect(parseBuildText("Refinery", "T").steps[0]?.actionId).toBe("refinery");
  });

  it("understands french names", () => {
    const { steps, race } = parseBuildText("14 0:18 Pylône\n16 Portail\nTraqueur x2");
    expect(race).toBe("P");
    expect(steps.map((s) => [s.actionId, s.count])).toEqual([
      ["pylon", 1],
      ["gateway", 1],
      ["stalker", 2],
    ]);
  });

  it("matches plurals and community abbreviations", () => {
    const { steps } = parseBuildText("Zerglings\nrax");
    expect(steps.map((s) => s.actionId)).toEqual(["zergling", "barracks"]);
  });
});
