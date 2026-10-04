import { describe, expect, it } from "vitest";
import { computeSupply, formatTime, lastStepReachedAt, parseTime, slugify, stepsToText } from "./build-math";
import type { Step } from "./schemas";

let n = 0;
const s = (actionId: string, extra: Partial<Step> = {}): Step => ({
  id: String(n++),
  kind: "step",
  count: 1,
  actionId,
  ...extra,
});

describe("formatTime", () => {
  it("formats seconds as m:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(18)).toBe("0:18");
    expect(formatTime(125)).toBe("2:05");
    expect(formatTime(3600)).toBe("60:00");
  });
});

describe("parseTime", () => {
  it.each([
    ["1:30", 90],
    ["0:18", 18],
    ["130", 90],
    ["1005", 605],
    ["45", 45],
    ["1.30", 90],
    [" 2:05 ", 125],
  ])("parses %s", (input, expected) => {
    expect(parseTime(input)).toBe(expected);
  });

  it.each(["", "abc", "1:75", "1:2:3"])("rejects %j", (input) => {
    expect(parseTime(input)).toBeNull();
  });
});

describe("computeSupply", () => {
  it("counts workers from 12", () => {
    const result = computeSupply("P", [s("probe"), s("probe"), s("pylon")]);
    expect(result.map((r) => r.supply)).toEqual([12, 13, 14]);
  });

  it("multiplies by count", () => {
    const result = computeSupply("T", [s("marine", { count: 3 }), s("scv")]);
    expect(result[1]?.supply).toBe(15);
  });

  it("subtracts drones for zerg buildings", () => {
    const result = computeSupply("Z", [s("drone"), s("spawning-pool"), s("drone")]);
    expect(result.map((r) => r.supply)).toEqual([12, 13, 12]);
  });

  it("resyncs on an explicit supply override", () => {
    const result = computeSupply("P", [s("probe"), s("pylon", { supply: 16 }), s("probe")]);
    expect(result.map((r) => r.supply)).toEqual([12, 16, 16]);
    expect(result[1]?.overridden).toBe(true);
  });

  it("tracks the supply cap and flags blocks", () => {
    const steps = [s("probe", { count: 3 }), s("probe"), s("pylon"), s("probe")];
    const result = computeSupply("P", steps);
    expect(result[0]?.cap).toBe(15);
    expect(result[1]?.blocked).toBe(true); // 15 + 1 > 15
    expect(result[3]?.cap).toBe(23);
    expect(result[3]?.blocked).toBe(false);
  });

  it("starts zerg at a 14 cap", () => {
    expect(computeSupply("Z", [s("drone")])[0]?.cap).toBe(14);
  });

  it("ignores sections and free-text steps", () => {
    const steps: Step[] = [
      { id: "x", kind: "section", count: 1, label: "Opening" },
      { id: "y", kind: "step", count: 1, label: "Scout" },
      s("probe"),
    ];
    expect(computeSupply("P", steps).map((r) => r.supply)).toEqual([12, 12, 12]);
  });

  it("caps at 200", () => {
    const result = computeSupply("T", [s("command-center", { count: 20 }), s("scv")]);
    expect(result[1]?.cap).toBe(200);
  });
});

describe("stepsToText", () => {
  it("renders a readable plain-text build", () => {
    const steps: Step[] = [
      { id: "a", kind: "section", count: 1, label: "Opening" },
      s("pylon", { supply: 14, time: 18 }),
      s("zealot", { count: 2, note: "wall off" }),
      { id: "b", kind: "step", count: 1, label: "Scout" },
    ];
    expect(stepsToText(steps)).toBe(
      ["# Opening", "14  0:18  Pylon", "          Zealot x2 — wall off", "          Scout"].join("\n"),
    );
  });
});

describe("stepsToText in french", () => {
  it("uses french action names", () => {
    expect(stepsToText([s("pylon", { supply: 14 })], "fr")).toBe("14        Pylône");
  });
});

describe("slugify", () => {
  it("builds url-safe slugs", () => {
    expect(slugify("PvZ — 2 Base Blink!")).toBe("pvz-2-base-blink");
    expect(slugify("   ")).toBe("build");
    expect(slugify("a".repeat(100)).length).toBeLessThanOrEqual(60);
  });
});

describe("lastStepReachedAt", () => {
  const steps = [{ time: 0 }, {}, { time: 18 }, {}, { time: 40 }];

  it("returns the last timed step already reached", () => {
    expect(lastStepReachedAt(steps, 0)).toBe(0);
    expect(lastStepReachedAt(steps, 20)).toBe(2);
    expect(lastStepReachedAt(steps, 99)).toBe(4);
  });

  it("returns -1 before the first timed step", () => {
    expect(lastStepReachedAt([{}, { time: 10 }], 5)).toBe(-1);
  });
});
