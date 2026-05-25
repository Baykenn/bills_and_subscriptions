## Goal
A lightweight addon to the opensource app Wealthfolio, to track monthly/yearly spend on Subscriptions.

## What's been built
- Nothing shipped yet — project is in initial setup phase

## Where we are now
The repository exists but contains no application code. Only the Claude Dashboard task inbox integration (`.dashboard/inbox/`) is configured via CLAUDE.md. No features, tests, or architectural scaffolding are in place. This is a greenfield project.

## Direction
- Define the data model for a subscription entry (name, amount, billing cycle, category, start date, next billing date)
- Build a local storage or file-based persistence layer compatible with Wealthfolio's offline-first approach
- Implement a monthly and yearly spend summary view
- Create an import/export mechanism to avoid lock-in and support backup
- Integrate with Wealthfolio's UI conventions so the addon feels native rather than bolted on

## Key decisions
- Addon approach chosen over a fork — keeps the project maintainable as Wealthfolio evolves upstream
- Scope is intentionally narrow: subscription tracking only, not general expense tracking
- Claude Dashboard inbox pattern adopted for task management during development