import { describe, expect, it } from "vitest";
import { buildInputSchema, stepSchema } from "./schemas";

const step = { id: "a", kind: "step" as const, count: 1, actionId: "probe", supply: 12 };

describe("stepSchema", () => {
  it("accepts a referenced action", () => {
    expect(stepSchema.safeParse(step).success).toBe(true);
  });

  it("accepts a free-text step", () => {
    expect(stepSchema.safeParse({ id: "b", kind: "step", count: 1, label: "Scout" }).success).toBe(true);
  });

  it("rejects a step with neither action nor label", () => {
    expect(stepSchema.safeParse({ id: "c", kind: "step", count: 1 }).success).toBe(false);
  });

  it("requires a title for sections", () => {
    expect(stepSchema.safeParse({ id: "d", kind: "section", count: 1 }).success).toBe(false);
    expect(stepSchema.safeParse({ id: "d", kind: "section", count: 1, label: "Opening" }).success).toBe(true);
  });
});

describe("buildInputSchema", () => {
  const base = { title: "2 base Blink", race: "P", vsRace: "Z", steps: [step] };

  it("applies defaults", () => {
    const parsed = buildInputSchema.parse(base);
    expect(parsed).toMatchObject({ description: "", tags: [], visibility: "public" });
  });

  it("rejects duplicate tags", () => {
    expect(buildInputSchema.safeParse({ ...base, tags: ["macro", "macro"] }).success).toBe(false);
  });

  it("rejects empty builds", () => {
    expect(buildInputSchema.safeParse({ ...base, steps: [] }).success).toBe(false);
  });
});
