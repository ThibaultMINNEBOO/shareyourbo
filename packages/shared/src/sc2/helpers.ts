import type { Race } from "../schemas";
import type { ActionKind, GameAction } from "./types";

type Extra = Partial<Pick<GameAction, "supplyCap" | "aliases">>;

export function factory(race: Race) {
  const make =
    (kind: ActionKind) =>
    (
      id: string,
      name: string,
      short: string,
      [minerals, gas]: [number, number],
      time: number,
      supply = 0,
      extra: Extra = {},
    ): GameAction => ({ id, name, short, race, kind, minerals, gas, time, supply, ...extra });

  const upgrade = make("upgrade");

  return {
    unit: make("unit"),
    building: make("building"),
    upgrade,
    ability: (id: string, name: string, short: string, aliases?: string[]) =>
      make("ability")(id, name, short, [0, 0], 0, 0, { aliases }),
    /** Three-level weapon/armor upgrades: "+1 Infantry Weapons" etc. */
    levels(
      id: string,
      name: string,
      short: string,
      costs: [number, number][],
      times: number[],
      aliases: string[] = [],
    ) {
      return costs.map((cost, i) =>
        upgrade(`${id}-${i + 1}`, `${name} Level ${i + 1}`, `${short}${i + 1}`, cost, times[i] ?? 0, 0, {
          aliases: [`+${i + 1} ${name}`, ...aliases.map((a) => `+${i + 1} ${a}`)],
        }),
      );
    },
  };
}
