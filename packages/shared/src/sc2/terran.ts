import { factory } from "./helpers";
import type { GameAction } from "./types";

const { unit, building, upgrade, ability, levels } = factory("T");

const L13 = { costs: [[100, 100], [175, 175], [250, 250]] as [number, number][], times: [114, 136, 157] };

export const terran: GameAction[] = [
  // Units
  unit("scv", "SCV", "SCV", [50, 0], 12, 1, { aliases: ["worker"] }),
  unit("marine", "Marine", "Mrn", [50, 0], 18, 1),
  unit("reaper", "Reaper", "Rpr", [50, 50], 32, 1),
  unit("marauder", "Marauder", "Mrd", [100, 25], 21, 2),
  unit("ghost", "Ghost", "Gst", [150, 125], 29, 2),
  unit("hellion", "Hellion", "Hel", [100, 0], 21, 2),
  unit("hellbat", "Hellbat", "Hbt", [100, 0], 21, 2),
  unit("widow-mine", "Widow Mine", "WM", [75, 25], 21, 2, { aliases: ["mine"] }),
  unit("cyclone", "Cyclone", "Cyc", [125, 50], 32, 3),
  unit("siege-tank", "Siege Tank", "Tank", [150, 125], 32, 3, { aliases: ["tank"] }),
  unit("thor", "Thor", "Thor", [300, 200], 43, 6),
  unit("viking", "Viking", "Vik", [150, 75], 30, 2),
  unit("medivac", "Medivac", "Med", [100, 100], 30, 2),
  unit("liberator", "Liberator", "Lib", [150, 125], 43, 3),
  unit("raven", "Raven", "Rav", [100, 150], 34, 2),
  unit("banshee", "Banshee", "Bsh", [150, 100], 43, 3),
  unit("battlecruiser", "Battlecruiser", "BC", [400, 300], 64, 6, { aliases: ["bc"] }),

  // Buildings
  building("command-center", "Command Center", "CC", [400, 0], 71, 0, { supplyCap: 15, aliases: ["cc", "expand", "natural"] }),
  building("orbital-command", "Orbital Command", "OC", [150, 0], 25, 0, { aliases: ["oc", "orbital"] }),
  building("planetary-fortress", "Planetary Fortress", "PF", [150, 150], 36, 0, { aliases: ["pf"] }),
  building("supply-depot", "Supply Depot", "Dpt", [100, 0], 21, 0, { supplyCap: 8, aliases: ["depot"] }),
  building("refinery", "Refinery", "Gas", [75, 0], 21, 0, { aliases: ["gas"] }),
  building("barracks", "Barracks", "Rax", [150, 0], 46, 0, { aliases: ["rax"] }),
  building("engineering-bay", "Engineering Bay", "Ebay", [125, 0], 25, 0, { aliases: ["ebay"] }),
  building("bunker", "Bunker", "Bnkr", [100, 0], 29),
  building("missile-turret", "Missile Turret", "Tur", [100, 0], 18, 0, { aliases: ["turret"] }),
  building("sensor-tower", "Sensor Tower", "Snsr", [125, 50], 18),
  building("factory", "Factory", "Fact", [150, 100], 43, 0, { aliases: ["fact"] }),
  building("ghost-academy", "Ghost Academy", "GA", [150, 50], 29),
  building("armory", "Armory", "Arm", [150, 100], 46),
  building("starport", "Starport", "Port", [150, 100], 36, 0, { aliases: ["port"] }),
  building("fusion-core", "Fusion Core", "FC", [150, 150], 46),
  building("tech-lab", "Tech Lab", "TL", [50, 25], 18, 0, { aliases: ["techlab"] }),
  building("reactor", "Reactor", "Rct", [50, 50], 36),

  // Upgrades
  upgrade("stimpack", "Stimpack", "Stim", [100, 100], 100, 0, { aliases: ["stim"] }),
  upgrade("combat-shield", "Combat Shield", "CS", [100, 100], 79, 0, { aliases: ["shield"] }),
  upgrade("concussive-shells", "Concussive Shells", "Conc", [50, 50], 43, 0, { aliases: ["concussive"] }),
  upgrade("infernal-pre-igniter", "Infernal Pre-Igniter", "Blue", [100, 100], 79, 0, { aliases: ["blue flame"] }),
  upgrade("drilling-claws", "Drilling Claws", "Drll", [75, 75], 79),
  upgrade("smart-servos", "Smart Servos", "Srvo", [100, 100], 79),
  upgrade("hyperflight-rotors", "Hyperflight Rotors", "Rtrs", [125, 125], 93, 0, { aliases: ["banshee speed"] }),
  upgrade("cloaking-field", "Cloaking Field", "Clk", [100, 100], 79, 0, { aliases: ["banshee cloak"] }),
  upgrade("advanced-ballistics", "Advanced Ballistics", "Bal", [150, 150], 79),
  upgrade("personal-cloaking", "Personal Cloaking", "PCl", [150, 150], 86, 0, { aliases: ["ghost cloak"] }),
  upgrade("hisec-auto-tracking", "Hi-Sec Auto Tracking", "HiSc", [100, 100], 57),
  upgrade("neosteel-armor", "Neosteel Armor", "Neo", [150, 150], 100, 0, { aliases: ["building armor"] }),
  upgrade("weapon-refit", "Weapon Refit", "Yam", [150, 150], 43, 0, { aliases: ["yamato"] }),
  ...levels("infantry-weapons", "Infantry Weapons", "IW", L13.costs, L13.times, ["attack"]),
  ...levels("infantry-armor", "Infantry Armor", "IA", L13.costs, L13.times),
  ...levels("vehicle-weapons", "Vehicle Weapons", "VW", L13.costs, L13.times),
  ...levels("ship-weapons", "Ship Weapons", "SW", L13.costs, L13.times),
  ...levels("vehicle-ship-plating", "Vehicle & Ship Plating", "VP", L13.costs, L13.times),

  // Abilities
  ability("mule", "Call Down MULE", "MULE", ["mule"]),
  ability("scan", "Scanner Sweep", "Scan", ["scan"]),
  ability("lift-off", "Lift Off", "Lift", ["float"]),
];
