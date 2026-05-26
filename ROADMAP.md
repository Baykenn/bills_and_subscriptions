## Goal
A lightweight addon for [Wealthfolio](https://wealthfolio.app) to track monthly/yearly spend on subscriptions and recurring bills.

## What's been shipped (v1.0.0)

- Subscriptions tab — CRUD list with category badges, favicon logos, active/paused toggle, multi-currency support
- Bills tab — monthly grouping, paid/unpaid toggle with auto-next-occurrence for recurring bills, category colour coding
- Summary tab — combined spend card, subscription category breakdown, bill category breakdown, 6-month bar/cumulative chart
- Multi-currency display (20 currencies, no forced FX conversion)
- Favicon auto-fetch via website field
- Settings panel — toggle Bills tab on/off

## Planned

- Import / export (JSON backup/restore)
- Spending trend alerts (e.g. notify when monthly total crosses a threshold)
- macOS deploy path support in `scripts/deploy.mjs`
- Trial/renewal date reminders

## Key decisions

- **Addon approach** over a fork — stays maintainable as Wealthfolio evolves upstream
- **Scope is intentionally narrow** — subscription + bill tracking only, not general expense tracking
- **localStorage** — offline-first, no server required; keys prefixed `ss:` to avoid collisions
- **No FX conversion** — multi-currency totals are shown per-currency rather than rolled up at a potentially wrong rate
