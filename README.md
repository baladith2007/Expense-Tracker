# Personal Expense Tracker

A minimal, clean personal expense tracker built with **vanilla HTML, CSS, and JavaScript** — no build step, no framework.

## Features

- **Expenses** — add, edit, delete with date, amount, multi-currency, category, merchant, and note.
- **Categories** — sensible defaults (Rent, Utilities, Food, Software/Tools, Marketing, Hardware, Travel, Misc) plus add your own.
- **Budgets** — set a monthly budget per category with live progress bars and over-budget warnings.
- **Recurring expenses** — daily / weekly / monthly / yearly, with automatic catch-up for missed periods.
- **Filters & search** — date range, category, text search, and sorting (date / amount). Your selections persist across edits.
- **Responsive lists** — the expenses and recurring tables collapse into labelled cards on narrow screens, so every field (date, merchant, category, amount, note, actions) is reachable without horizontal scrolling.
- **Overview dashboard** — total, this-month total, count, category doughnut chart, and monthly trend bar chart.
- **Multi-currency** — track each expense in its own currency; totals and charts convert to your base currency using editable FX rates.
- **Import / Export** — full JSON export/import and expenses-only CSV export.
- **Dark mode** — light / dark / system theme, persisted in settings.
- **PWA** — installable, with a service worker that caches the entire app (including Chart.js) for full offline use.
- **localStorage persistence** — everything is stored locally in your browser; no backend.

Then open <http://localhost:8080>.
live demo: https://expensetracker-baladith-r.vercel.app/
