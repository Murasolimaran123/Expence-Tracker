# Expense Tracker (PWA)

A responsive, offline-capable expense tracker that runs entirely in the browser. No backend required. Data is stored locally in your browser. Installable on mobile and desktop as a Progressive Web App (PWA).

## Features
- Add, edit, delete expenses with validation
- Filters: search, category, date range; Sorting by date/amount
- Summary cards: total, this month, record count
- Year-wise totals (sorted by amount), Month-wise totals per year (sorted by amount)
- Export current view to Excel (CSV) or PDF with selectable duration (All / Year / Month / From–To)
- Import JSON and Clear All
- LocalStorage persistence
- Dark/Light theme toggle
- Live date-time in the header
- Notifications (optional): daily total, month-end total, year-end total (after 9 PM)
- PWA install and offline support

## Quick start

Open with a local server (required for PWA/service worker):

- Python
```bash
python -m http.server 5500
# then open http://localhost:5500/
```

- Node
```bash
npx serve -l 5500
# then open http://localhost:5500/
```

Or use any static server. Just serve the folder root so `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, and `sw.js` are accessible.

## Usage
- Add an expense via the form; click Edit/Delete in the table to manage items
- Use Filters to narrow results; sorting is controlled via the Sort by dropdown
- Summary shows totals; By Year and By Month sections aggregate amounts
- Export buttons open a dialog to choose duration and then download CSV or open a print-to-PDF view
- Import JSON to load expenses; Clear All removes every record
- Theme button toggles light/dark; clock shows local date/time
- Bell button opens Notification Settings to enable Daily/Monthly/Yearly notifications; permissions requested only if any are turned on

## Data model
Each expense is stored in LocalStorage as:
```json
{
  "id": "string",
  "title": "Coffee",
  "amount": 4.5,
  "category": "Food",
  "date": "YYYY-MM-DD",
  "payment": "Cash|Card|UPI|Online",
  "notes": "Optional"
}
```

## PWA
- Manifest: `manifest.webmanifest`
- Service worker: `sw.js` (cache-first for app shell files)
- Install: an Install button appears when available; can also use browser menu (Add to Home Screen / Install App)

## Export/Import
- Export CSV: compatible with Excel; uses the current filtered+sorted view and selected duration
- Export PDF: opens a print-friendly table; use the browser’s Save as PDF
- Import JSON: expects an array of expenses (fields above); unknown fields are ignored

## Privacy
All data stays in your browser. No servers are contacted. Notifications are local and based on your stored data.

## Development
- No build step; plain HTML/CSS/JS
- Main files:
  - `index.html` (markup and UI)
  - `styles.css` (responsive styling, themes)
  - `app.js` (logic, state, persistence, exports, notifications, PWA registration)
  - `sw.js` (service worker)

## Deploy
Any static host works (GitHub Pages, Netlify, Vercel). For GitHub Pages on `main`:
1. Commit and push
2. In repo Settings → Pages → Build and deployment → Source: Deploy from a branch; Branch: `main` / `/ (root)`
3. Open the published URL once to activate the service worker

## License
MIT