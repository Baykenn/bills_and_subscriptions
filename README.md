# Bills & Subscriptions

A [Wealthfolio](https://wealthfolio.app) addon that tracks your recurring subscriptions and bills so you can see exactly where your money goes each month.

## Features

- **Subscriptions tab** — add, edit, pause, or delete recurring services (Netflix, Spotify, etc.)
- **Bills tab** — track irregular bills (electricity, water, rent) grouped by month; mark them paid with one click; recurring bills auto-generate the next occurrence when marked paid
- **Summary tab** — combined monthly/yearly spend card, category breakdowns with progress bars, and a 6-month bill history chart with cumulative line
- **Multi-currency** — 20 supported currencies, shown separately (no forced conversion)
- **Favicon logos** — enter a website URL and the addon fetches the service's icon automatically
- **Offline-first** — all data lives in `localStorage`; no server, no account required

## Requirements

- [Wealthfolio](https://wealthfolio.app) desktop app (Windows / macOS)
- Node.js 18+ (for building from source)

## Installation

### From source

```bash
git clone https://github.com/Baykenn/bills-and-subscriptions
cd bills-and-subscriptions
npm install
npm run ship        # builds and deploys to Wealthfolio in one step
```

Then open Wealthfolio, go to **Settings → Addons**, and enable **Bills & Subscriptions**.

### Development (watch mode)

```bash
npm run dev:deploy  # rebuilds and redeploys on every file save
```

## Project structure

```
src/
  addon.tsx                   # Entry point — registers sidebar + routes
  context.ts                  # AddonContext singleton
  lib/
    storage.ts                # Data model, CRUD, currency helpers
    useBaseCurrency.ts        # Hook to read Wealthfolio's base currency
  pages/
    SubscriptionsPage.tsx     # Subscriptions list + add/edit modal
    BillsPage.tsx             # Bills list grouped by month
    SummaryPage.tsx           # Stat cards, charts, category breakdown
  components/
    PageLayout.tsx            # Tab nav wrapper
    LogoAvatar.tsx            # Favicon fetching + initials fallback
    SubForm.tsx               # Subscription add/edit form
scripts/
  deploy.mjs                  # One-shot build → Wealthfolio deploy
  watch-deploy.mjs            # Watch + deploy on change
```

## Tech stack

- React 19, TypeScript 5, Tailwind CSS v4
- Vite 7 (build)
- `@wealthfolio/addon-sdk` ^3.3.0

## License

MIT — see [LICENSE](LICENSE)
