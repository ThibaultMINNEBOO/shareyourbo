// Seeds the local dev database through the running API (`pnpm dev` first).
// Dev-only account: probe@sybo.test / devpassword123
const API = process.env.API_URL ?? "http://localhost:8787";
const ORIGIN = "http://localhost:5173";
const DEV_USER = { email: "probe@sybo.test", password: "devpassword123", username: "ProbeRush", name: "ProbeRush" };

let n = 0;
const step = (actionId, extra = {}) => ({ id: `s${n++}`, kind: "step", count: 1, actionId, ...extra });
const note = (label, extra = {}) => ({ id: `s${n++}`, kind: "step", count: 1, label, ...extra });
const section = (label) => ({ id: `s${n++}`, kind: "section", count: 1, label });

const BUILDS = [
  {
    title: "Stargate Phoenix into Blink Stalkers",
    race: "P",
    vsRace: "Z",
    tags: ["macro"],
    patch: "5.0.14",
    description: "Safe standard PvZ: phoenix to deny scouting and harass overlords, then transition into blink stalkers on 3 bases.",
    steps: [
      section("Opening"),
      step("probe", { count: 2 }),
      step("pylon", { time: 18 }),
      step("probe", { count: 2 }),
      step("gateway", { time: 38, note: "Chrono probes" }),
      step("chrono-boost"),
      step("assimilator", { time: 48 }),
      step("probe", { count: 2 }),
      step("nexus", { time: 81 }),
      step("cybernetics-core", { time: 92 }),
      step("assimilator", { time: 101 }),
      step("pylon", { time: 115 }),
      section("Stargate"),
      step("adept", { time: 135, note: "Shade into the mineral line" }),
      step("warp-gate", { time: 140 }),
      step("stargate", { time: 155 }),
      step("probe", { count: 3 }),
      step("phoenix", { time: 210, note: "Chrono" }),
      step("pylon"),
      step("phoenix", { count: 2 }),
      section("Transition"),
      step("nexus", { time: 255 }),
      step("twilight-council", { time: 270 }),
      step("blink", { time: 300 }),
      step("gateway", { count: 3 }),
      note("Scout for roach/ravager timings"),
    ],
  },
  {
    title: "Hatch Pool Gas — 3 base Roach Ravager",
    race: "Z",
    vsRace: "T",
    tags: ["timing"],
    patch: "5.0.14",
    description: "Standard hatch first opening into a hard-hitting roach/ravager timing around 5:30.",
    steps: [
      section("Opening"),
      step("drone"),
      step("overlord", { time: 12 }),
      step("drone", { count: 3 }),
      step("hatchery", { time: 50 }),
      step("drone", { count: 2 }),
      step("extractor", { time: 62 }),
      step("spawning-pool", { time: 70 }),
      step("drone", { count: 2 }),
      step("overlord"),
      step("queen", { count: 2, time: 125 }),
      step("zergling", { count: 2 }),
      step("metabolic-boost", { time: 130 }),
      section("Third base"),
      step("hatchery", { time: 150 }),
      step("queen"),
      step("overlord", { count: 2 }),
      step("roach-warren", { time: 210 }),
      step("lair", { time: 220 }),
      step("extractor", { count: 2 }),
      section("Timing"),
      step("glial-reconstitution", { time: 280 }),
      step("roach", { count: 8 }),
      step("ravager", { count: 4, note: "Bile the bunkers" }),
      note("Move out at 5:30", { time: 330 }),
    ],
  },
  {
    title: "Reaper Expand into 3 CC",
    race: "T",
    vsRace: "P",
    tags: ["macro", "greedy"],
    description: "Reaper first for scouting, fast expand and a quick third command center.",
    steps: [
      step("scv", { count: 2 }),
      step("supply-depot", { time: 18 }),
      step("barracks", { time: 41 }),
      step("refinery", { time: 45 }),
      step("scv", { count: 3 }),
      step("reaper", { time: 87, note: "Scout for proxies" }),
      step("orbital-command"),
      step("command-center", { time: 100 }),
      step("supply-depot"),
      step("factory", { time: 130 }),
      step("refinery"),
      step("reactor"),
      step("starport"),
      step("command-center", { time: 190 }),
      step("viking"),
    ],
  },
  {
    title: "12 Pool Ling Flood",
    race: "Z",
    vsRace: "P",
    tags: ["cheese", "all-in"],
    description: "All-in early pool. Pull drones only if the Protoss walls badly.",
    steps: [
      step("spawning-pool", { time: 0, note: "Immediately" }),
      step("drone"),
      step("overlord"),
      step("zergling", { count: 3 }),
      step("queen"),
      step("zergling", { count: 3 }),
      note("Attack before the cyber core finishes"),
    ],
  },
];

async function call(path, init = {}, cookie) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Origin: ORIGIN, ...(cookie ? { Cookie: cookie } : {}) },
  });
  return res;
}

function cookieFrom(res) {
  return res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}

let res = await call("/api/auth/sign-in/email", {
  method: "POST",
  body: JSON.stringify({ email: DEV_USER.email, password: DEV_USER.password }),
});
if (!res.ok) res = await call("/api/auth/sign-up/email", { method: "POST", body: JSON.stringify(DEV_USER) });
if (!res.ok) throw new Error(`Could not sign in the dev user: ${res.status} ${await res.text()}`);
const cookie = cookieFrom(res);

for (const build of BUILDS) {
  const created = await call("/api/builds", { method: "POST", body: JSON.stringify(build) }, cookie);
  const body = await created.json();
  console.log(created.ok ? `✓ ${build.title} → /b/${body.slug}` : `✗ ${build.title}: ${JSON.stringify(body)}`);
}
