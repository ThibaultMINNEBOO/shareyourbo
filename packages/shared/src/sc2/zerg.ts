import { factory } from "./helpers";
import type { GameAction } from "./types";

const { unit, building, upgrade, ability, levels } = factory("Z");

const L13: [number, number][] = [[100, 100], [150, 150], [200, 200]];
const carapace: [number, number][] = [[150, 150], [225, 225], [300, 300]];
const times = [114, 136, 157];

export const zerg: GameAction[] = [
  // Units
  unit("drone", "Drone", "Drn", [50, 0], 12, 1, { aliases: ["worker"] }),
  unit("overlord", "Overlord", "OL", [100, 0], 18, 0, { supplyCap: 8, aliases: ["ovie", "ol"] }),
  unit("queen", "Queen", "Qn", [150, 0], 36, 2),
  // One larva hatches a pair of zerglings: 1 supply, 50 minerals.
  unit("zergling", "Zergling ×2", "Ling", [50, 0], 17, 1, { aliases: ["ling", "zergling", "pair"] }),
  unit("baneling", "Baneling", "Bane", [25, 25], 14, 0, { aliases: ["bane"] }),
  unit("roach", "Roach", "Rch", [75, 25], 19, 2),
  unit("ravager", "Ravager", "Rvg", [25, 75], 9, 1),
  unit("overseer", "Overseer", "Ovs", [50, 50], 12, 0),
  unit("hydralisk", "Hydralisk", "Hyd", [100, 50], 24, 2, { aliases: ["hydra"] }),
  unit("lurker", "Lurker", "Lrk", [50, 100], 18, 1),
  unit("infestor", "Infestor", "Inf", [100, 150], 36, 2),
  unit("swarm-host", "Swarm Host", "SH", [100, 75], 29, 3),
  unit("mutalisk", "Mutalisk", "Muta", [100, 100], 24, 2, { aliases: ["muta"] }),
  unit("corruptor", "Corruptor", "Cor", [150, 100], 29, 2),
  unit("brood-lord", "Brood Lord", "BL", [150, 150], 24, 2, { aliases: ["broods"] }),
  unit("viper", "Viper", "Vpr", [100, 200], 29, 3),
  unit("ultralisk", "Ultralisk", "Ult", [275, 200], 39, 6, { aliases: ["ultra"] }),

  // Buildings (a drone morphs into the building: -1 supply)
  building("hatchery", "Hatchery", "Hat", [275, 0], 71, -1, { supplyCap: 6, aliases: ["hatch", "expand", "natural"] }),
  building("extractor", "Extractor", "Gas", [25, 0], 21, -1, { aliases: ["gas"] }),
  building("spawning-pool", "Spawning Pool", "Pool", [200, 0], 46, -1, { aliases: ["pool"] }),
  building("evolution-chamber", "Evolution Chamber", "Evo", [75, 0], 25, -1, { aliases: ["evo"] }),
  building("roach-warren", "Roach Warren", "RW", [150, 0], 39, -1, { aliases: ["warren"] }),
  building("baneling-nest", "Baneling Nest", "BN", [100, 50], 43, -1, { aliases: ["bane nest"] }),
  building("spine-crawler", "Spine Crawler", "Spn", [100, 0], 36, -1, { aliases: ["spine"] }),
  building("spore-crawler", "Spore Crawler", "Spr", [75, 0], 21, -1, { aliases: ["spore"] }),
  building("lair", "Lair", "Lair", [150, 100], 57, 0),
  building("hydralisk-den", "Hydralisk Den", "HD", [100, 100], 29, -1, { aliases: ["hydra den", "den"] }),
  building("lurker-den", "Lurker Den", "LD", [100, 150], 57, -1),
  building("infestation-pit", "Infestation Pit", "Pit", [100, 100], 36, -1, { aliases: ["pit"] }),
  building("spire", "Spire", "Spi", [200, 200], 71, -1),
  building("nydus-network", "Nydus Network", "Nyd", [150, 150], 36, -1, { aliases: ["nydus"] }),
  building("hive", "Hive", "Hive", [200, 150], 71, 0),
  building("ultralisk-cavern", "Ultralisk Cavern", "UC", [150, 200], 46, -1, { aliases: ["cavern"] }),
  building("greater-spire", "Greater Spire", "GS", [100, 150], 71, 0),

  // Upgrades
  upgrade("metabolic-boost", "Metabolic Boost", "Spd", [100, 100], 79, 0, { aliases: ["ling speed", "speed"] }),
  upgrade("adrenal-glands", "Adrenal Glands", "Adr", [200, 200], 46, 0, { aliases: ["adrenal"] }),
  upgrade("centrifugal-hooks", "Centrifugal Hooks", "Hks", [100, 100], 71, 0, { aliases: ["bane speed"] }),
  upgrade("glial-reconstitution", "Glial Reconstitution", "Gli", [100, 100], 79, 0, { aliases: ["roach speed"] }),
  upgrade("tunneling-claws", "Tunneling Claws", "Tun", [100, 100], 79),
  upgrade("burrow", "Burrow", "Bur", [100, 100], 71),
  upgrade("muscular-augments", "Muscular Augments", "Msc", [100, 100], 64, 0, { aliases: ["hydra speed"] }),
  upgrade("grooved-spines", "Grooved Spines", "Grv", [100, 100], 50, 0, { aliases: ["hydra range"] }),
  upgrade("pneumatized-carapace", "Pneumatized Carapace", "Ovl", [100, 100], 43, 0, { aliases: ["overlord speed"] }),
  upgrade("neural-parasite", "Neural Parasite", "Nrl", [100, 100], 79),
  upgrade("chitinous-plating", "Chitinous Plating", "Chi", [150, 150], 79, 0, { aliases: ["ultra armor"] }),
  upgrade("anabolic-synthesis", "Anabolic Synthesis", "Ana", [150, 150], 43, 0, { aliases: ["ultra speed"] }),
  ...levels("melee-attacks", "Melee Attacks", "MA", L13, times, ["melee"]),
  ...levels("missile-attacks", "Missile Attacks", "MsA", L13, times, ["ranged"]),
  ...levels("ground-carapace", "Ground Carapace", "GC", carapace, times, ["carapace"]),
  ...levels("flyer-attacks", "Flyer Attacks", "FA", L13, times),
  ...levels("flyer-carapace", "Flyer Carapace", "FC", carapace, times),

  // Abilities
  ability("inject-larva", "Inject Larva", "Inj", ["inject"]),
  ability("spread-creep", "Spread Creep", "Crp", ["creep", "tumor"]),
];
