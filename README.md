# ShareYourBO

Create, share and play StarCraft II build orders.

- **Browse** builds by race, matchup, style and popularity
- **Read** them in a clean step list (supply, time, action, notes, sections)
- **Play mode**: full-screen, one step at a time, with a game clock that follows timed steps — made for a second screen
- **Editor**: keyboard-first (`/` then `2 probe` ⏎ `pylon` ⏎ …), supply computed automatically, drag & drop, undo/redo, autosaved drafts
- **Import** builds pasted from Spawning Tool, Liquipedia or a notepad; **fork** any build
- **English / French** interface, switchable at any time from the header

## Stack

| Part | Tech | Hosting |
| --- | --- | --- |
| `apps/web` | React 19, Vite, TanStack Router + Query, shadcn/ui (radix-nova, tweakcn *cosmic-night* theme), Tailwind v4 | Vercel |
| `apps/api` | Hono, Better Auth (email + password), Drizzle ORM | Cloudflare Workers + D1 |
| `packages/shared` | Zod schemas, SC2 game data, supply/time helpers, text import | — |

The web app calls `/api/*` on its own origin. In development Vite proxies it to `wrangler dev`; in production a Vercel rewrite forwards it to the Worker. Auth cookies therefore stay first-party.

The client is fully typed from the API through Hono RPC (`hc<AppType>`).

## Getting started

Requirements: Node 22+ and pnpm 11.

```bash
pnpm install
```

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

Fill in `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), then create the local database:

```bash
pnpm --filter @sybo/api db:migrate:local
```

Start the API (port 8787) and the web app (port 5173):

```bash
pnpm dev
```

Optionally load sample builds (with `pnpm dev` running). This creates a local dev account `probe@sybo.test` / `devpassword123`:

```bash
pnpm --filter @sybo/api db:seed
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | API + web in parallel |
| `pnpm test` | Unit tests (shared, web) and API integration tests in the Workers runtime |
| `pnpm typecheck` | TypeScript across all packages |
| `pnpm build` | Production build of the web app |
| `pnpm --filter @sybo/api db:generate` | Generate a migration after editing `apps/api/src/db/schema.ts` |
| `pnpm --filter @sybo/api db:migrate:local` / `db:migrate:remote` | Apply migrations to the local / production D1 |

## Project layout

```
apps/api/src
  index.ts            Hono app (exports AppType for the RPC client)
  auth.ts             Better Auth config (PBKDF2 password hashing via Web Crypto)
  db/schema.ts        Drizzle tables
  routes/             builds, users
apps/web/src
  routes/             file-based routes (/, /b/:slug, /b/:slug/edit, /b/:slug/play, /new, /u/:username, /login, /signup)
  components/build-editor   editor state (reducer + history), palette, rows, import
  components/build-viewer   step list, play mode, like/copy actions
packages/shared/src
  sc2/                units, buildings, upgrades and abilities per race
  build-math.ts       supply suggestions, time parsing, text export
  import-text.ts      pasted-build parser
```

## Translations

UI strings live in `apps/web/src/i18n`: `en.ts` is the source dictionary and `fr.ts` must have exactly the same keys (TypeScript enforces it, and a test checks it too).

```tsx
const { t, rich } = useI18n()
t('editor.publish')                          // plain string
t('common.steps', { count: 3 })              // plural, via Intl.PluralRules
rich('build.by', { author: <Link … /> })     // placeholders replaced by React nodes
```

To add a language, add a dictionary typed as `Messages` and list it in `LOCALES` and `LOCALE_NAMES`. The app starts in the language saved in `localStorage`, then the browser language, and falls back to English. Unit names stay in English on purpose: it is how the community writes builds.

## Deployment

### API on Cloudflare

`apps/api/wrangler.jsonc` holds the production values.

1. Set `WEB_ORIGIN` to your Vercel URL.
2. Deploy once: Wrangler provisions the D1 database on the first deploy.

   ```bash
   pnpm --filter @sybo/api run deploy
   ```

3. Apply the migrations and set the auth secret:

   ```bash
   pnpm --filter @sybo/api db:migrate:remote
   ```

   ```bash
   pnpm --filter @sybo/api exec wrangler secret put BETTER_AUTH_SECRET
   ```

### Web on Vercel

1. Create a Vercel project with **Root Directory** `apps/web`. Vercel detects the pnpm workspace.
2. In `apps/web/vercel.json`, replace `YOUR-SUBDOMAIN` in the `/api` rewrite with the Worker URL printed by `wrangler deploy`.
3. Deploy.

## Notes

- Supply values are computed from the game data and can be overridden per step; an override re-anchors the following steps.
- Unit costs and build times in the palette are approximate and for information only.
- The Worker's `compatibility_date` follows the newest date supported by the local test runtime (`@cloudflare/vitest-pool-workers`).
