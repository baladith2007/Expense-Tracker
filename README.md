# Personal Expense Tracker

A minimal, clean personal expense tracker built with **vanilla HTML, CSS, and JavaScript** — no build step, no framework. Designed as a mini project for a design studio.

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

## Project Structure

```
expense-tracker/
├── index.html          # App shell and all views
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline caching)
├── server.js           # Tiny static dev server (Node, no deps)
├── css/
│   ├── base.css        # Reset and base styles
│   ├── themes.css      # Design tokens, light/dark/system themes
│   ├── components.css  # Cards, buttons, forms, tables, charts, toast
│   └── layout.css      # Header, tabs, container, responsive rules
├── js/
│   ├── app.js          # App bootstrap, wiring, event handlers
│   ├── storage.js      # localStorage load/save + defaults
│   ├── models.js       # Expense / recurring / budget factories
│   ├── utils.js        # IDs, currency/date formatting, FX conversion
│   ├── ui.js           # Rendering (tables, lists, selects, summary)
│   ├── charts.js       # Chart.js doughnut + trend charts
│   ├── recurring.js    # Recurring due-date generation
│   ├── csv.js          # JSON / CSV export + JSON import
│   ├── pwa.js          # Service worker registration
│   └── vendor/
│       └── chart.umd.min.js   # Chart.js, vendored for offline use
├── assets/
│   ├── icon-192.png
│   └── icon-512.png
```

## Running Locally

ES modules require an HTTP server (opening `index.html` directly via `file://` will not work).

**Option A — included dev server (no dependencies):**

```powershell
node server.js
```

Then open <http://localhost:8080>.

**Option B — any static server:**

```powershell
npx serve .
# or
python -m http.server 8080
```

## Deploying

Any static host works:

- **GitHub Pages** — push the folder and enable Pages.
- **Netlify / Vercel** — drag-and-drop the folder or connect the repo.

## Data & Privacy

All data lives in your browser's `localStorage` under the key `expensetracker:v1`. Nothing is sent anywhere. Use **Export** to back up or move data between browsers.

## Notes

- The app is fully self-contained: **Chart.js is vendored** at `js/vendor/chart.umd.min.js`, so no external requests are made and everything works offline. To upgrade Chart.js, download a newer `chart.umd.min.js` into that folder.
- The service worker uses a versioned cache (`expense-tracker-v1.2.0`). Bump `CACHE_NAME` in `sw.js` whenever you ship asset changes so returning users pick them up. If a change ever seems not to show up, do a hard refresh (Ctrl+F5) once.
- FX rates are manual (editable in **Settings**), expressed as *base units per 1 unit of the foreign currency*.
