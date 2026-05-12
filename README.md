# Caesar — rotary cipher

A small interactive Caesar cipher demo with a draggable rotary dial, encode/decode modes, a sharable QR code (the recipient solves the shift themselves), and a timed guess-the-shift mini-game.

Live: <https://drianediojanperez.github.io/caesar_cipher_demo/>

## Stack

- TanStack Start + Nitro (dev SSR, prerendered SPA shell for production)
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui (base-ui primitives) for Dialog, Popover, Button, Textarea
- motion / react for transitions
- qrcode.react

## Requirements

- [Bun](https://bun.sh) (used as the package manager and runtime)
- Node-compatible toolchain for builds (Bun provides this; no separate Node install needed)

## Install and run locally

```bash
git clone git@github.com:DrianeDiojanPerez/caesar_cipher_demo.git
cd caesar_cipher_demo
bun install
bun run dev
```

Open <http://localhost:3000>.

## Scripts

| Script           | What it does                                          |
| ---------------- | ----------------------------------------------------- |
| `bun run dev`    | Start the dev server at `http://localhost:3000`       |
| `bun run build`  | Production build — outputs the SPA shell to `.output/public` (used by CI for GitHub Pages) |
| `bun run preview`| Preview the production build locally                   |
| `bun run test`   | Run unit tests with Vitest                            |
| `bun run lint`   | Lint the source                                       |
| `bun run typecheck` | Type-check with `tsc --noEmit`                     |

## Deploy

The repo deploys to GitHub Pages on every push to `master` via `.github/workflows/deploy.yml`. The workflow builds the Start app, promotes `.output/public/_shell.html` to `index.html` + `404.html`, and uploads `.output/public` as the Pages artifact. Pages must be configured to use **GitHub Actions** as the source in repo settings.
