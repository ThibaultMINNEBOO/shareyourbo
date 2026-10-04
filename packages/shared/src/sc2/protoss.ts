import { factory } from "./helpers";
import type { GameAction } from "./types";

const { unit, building, upgrade, ability, levels } = factory("P");

const times = [129, 154, 179];

export const protoss: GameAction[] = [
  // Units
  unit("probe", "Probe", "Prb", [50, 0], 12, 1, { aliases: ["worker"] }),
  unit("zealot", "Zealot", "Zlt", [100, 0], 27, 2, { aliases: ["lot"] }),
  unit("stalker", "Stalker", "Stk", [125, 50], 30, 2),
  unit("sentry", "Sentry", "Snt", [50, 100], 26, 2),
  unit("adept", "Adept", "Adp", [100, 25], 30, 2),
  unit("high-templar", "High Templar", "HT", [50, 150], 39, 2, { aliases: ["ht", "templar"] }),
  unit("dark-templar", "Dark Templar", "DT", [125, 125], 39, 2, { aliases: ["dt"] }),
  unit("archon", "Archon", "Arch", [0, 0], 9, 0),
  unit("observer", "Observer", "Obs", [25, 75], 21, 1, { aliases: ["obs"] }),
  unit("warp-prism", "Warp Prism", "WP", [250, 0], 36, 2, { aliases: ["prism"] }),
  unit("immortal", "Immortal", "Imm", [275, 100], 39, 4),
  unit("colossus", "Colossus", "Col", [300, 200], 54, 6),
  unit("disruptor", "Disruptor", "Dsr", [150, 150], 36, 3),
  unit("phoenix", "Phoenix", "Phx", [150, 100], 25, 2),
  unit("oracle", "Oracle", "Orc", [150, 150], 37, 3),
  unit("void-ray", "Void Ray", "VR", [250, 150], 37, 4, { aliases: ["void"] }),
  unit("tempest", "Tempest", "Tmp", [250, 175], 43, 5),
  unit("carrier", "Carrier", "Car", [350, 250], 64, 6),
  unit("mothership", "Mothership", "MS", [400, 400], 79, 8),

  // Buildings
  building("nexus", "Nexus", "Nex", [400, 0], 71, 0, { supplyCap: 15, aliases: ["expand", "natural"] }),
  building("pylon", "Pylon", "Pyl", [100, 0], 18, 0, { supplyCap: 8 }),
  building("assimilator", "Assimilator", "Gas", [75, 0], 21, 0, { aliases: ["gas"] }),
  building("gateway", "Gateway", "Gate", [150, 0], 46, 0, { aliases: ["gate"] }),
  building("forge", "Forge", "Frg", [150, 0], 32),
  building("cybernetics-core", "Cybernetics Core", "Core", [150, 0], 36, 0, { aliases: ["cyber", "core"] }),
  building("photon-cannon", "Photon Cannon", "Can", [150, 0], 29, 0, { aliases: ["cannon"] }),
  building("shield-battery", "Shield Battery", "Bat", [100, 0], 29, 0, { aliases: ["battery"] }),
  building("twilight-council", "Twilight Council", "TC", [150, 100], 36, 0, { aliases: ["twilight"] }),
  building("robotics-facility", "Robotics Facility", "Robo", [150, 100], 46, 0, { aliases: ["robo"] }),
  building("stargate", "Stargate", "SG", [150, 150], 43, 0, { aliases: ["sg"] }),
  building("templar-archives", "Templar Archives", "TA", [150, 200], 36, 0, { aliases: ["archives"] }),
  building("dark-shrine", "Dark Shrine", "DS", [150, 150], 71, 0, { aliases: ["shrine"] }),
  building("robotics-bay", "Robotics Bay", "RB", [150, 150], 46, 0, { aliases: ["robo bay"] }),
  building("fleet-beacon", "Fleet Beacon", "FB", [300, 200], 43),

  // Upgrades
  upgrade("warp-gate", "Warp Gate", "WG", [50, 50], 100, 0, { aliases: ["wg", "warpgate"] }),
  upgrade("charge", "Charge", "Chg", [100, 100], 100),
  upgrade("blink", "Blink", "Blk", [150, 150], 121),
  upgrade("resonating-glaives", "Resonating Glaives", "Glv", [100, 100], 100, 0, { aliases: ["glaives"] }),
  upgrade("psionic-storm", "Psionic Storm", "Strm", [200, 200], 79, 0, { aliases: ["storm"] }),
  upgrade("shadow-stride", "Shadow Stride", "Shd", [100, 100], 100, 0, { aliases: ["dt blink"] }),
  upgrade("extended-thermal-lance", "Extended Thermal Lance", "ETL", [150, 150], 100, 0, { aliases: ["colossus range"] }),
  upgrade("gravitic-boosters", "Gravitic Boosters", "GBo", [100, 100], 57, 0, { aliases: ["obs speed"] }),
  upgrade("gravitic-drive", "Gravitic Drive", "GDr", [100, 100], 57, 0, { aliases: ["prism speed"] }),
  upgrade("anion-pulse-crystals", "Anion Pulse-Crystals", "APC", [150, 150], 64, 0, { aliases: ["phoenix range"] }),
  upgrade("flux-vanes", "Flux Vanes", "Flx", [150, 150], 57, 0, { aliases: ["void ray speed"] }),
  ...levels("ground-weapons", "Ground Weapons", "GW", [[100, 100], [150, 150], [200, 200]], times, ["attack"]),
  ...levels("ground-armor", "Ground Armor", "GA", [[100, 100], [150, 150], [200, 200]], times),
  ...levels("shields", "Shields", "Sh", [[150, 150], [225, 225], [300, 300]], times),
  ...levels("air-weapons", "Air Weapons", "AW", [[100, 100], [175, 175], [250, 250]], times),
  ...levels("air-armor", "Air Armor", "AA", [[150, 150], [225, 225], [300, 300]], times),

  // Abilities
  ability("chrono-boost", "Chrono Boost", "Chr", ["chrono", "cb"]),
];
