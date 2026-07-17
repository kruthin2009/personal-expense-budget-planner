# Daily Expenses Tracker

A personal expense & budget planner with an animated dashboard. The frontend is
**React + Vite + TypeScript**; all data is stored in a **real Excel file** —
`data/expenses.xlsx` — via a small local **Node/Express** server. You can open
that file in Microsoft Excel or Google Sheets at any time.

Original design: https://www.figma.com/design/gSummYCEXJMF4nzFLhS14g/Daily-expenses-tracker

---

## Prerequisites

- **Node.js 18+** (includes `npm`) — https://nodejs.org

Check it's installed:

```
node -v
npm -v
```

---

## Running the app

Install dependencies once:

```
npm install
```

Then start **both** the Excel API server and the web app together:

```
npm start
```

Now open **http://localhost:5173** in your browser.

- Web app  → http://localhost:5173
- API      → http://localhost:5174 (proxied under `/api`)

Adding, editing, or deleting a transaction in the UI writes straight to
`data/expenses.xlsx`. Your data survives page refreshes and restarts.
Press **Ctrl + C** in the terminal to stop.

### Running the two processes separately

```
npm run server   # Excel API only  (node server/index.js)
npm run dev      # web app only    (vite)
npm run build    # production build → creates a dist/ folder
```

---

## Features

- **Overview** — animated bar / line / donut charts, 7-day / month / all-time
  ranges, spend-by-category, and recent transactions.
- **Add / edit / delete transactions** — click **Add**, or hover a row and use
  the ✏️ (edit) / ✕ (delete) buttons. You can also **double-click a row** to edit.
- **Budgets** — set a monthly budget per category (click the `of ₹…` amount).
- **Settings** — switch chart type, apply preset color themes, customize colors.
- **Dark / light theme** toggle.

---

## Where the data lives

- `data/expenses.xlsx` — the database. Two sheets:
  - **Expenses**: `id | description | amount | category | date | type`
  - **Budgets**: `category | budget`
- Created automatically with sample rows the first time the server runs.
- **Keep this file to keep your data.** Delete it to reset back to the seed data.
- You can edit rows directly in Excel while the server is stopped; changes show
  up next time the app loads.

---

## API

| Method | Route                     | Purpose                          |
|--------|---------------------------|----------------------------------|
| GET    | `/api/expenses`           | List all transactions            |
| POST   | `/api/expenses`           | Add one (server assigns `id`)    |
| PUT    | `/api/expenses/:id`       | Edit an existing transaction     |
| DELETE | `/api/expenses/:id`       | Remove one                       |
| GET    | `/api/budgets`            | List category budgets            |
| PUT    | `/api/budgets/:category`  | Update one category's budget     |
| GET    | `/api/health`             | Server health check              |

---

## Sharing the project

Zip the project **without `node_modules`** (it's large and regenerated on
install). The recipient just runs:

```
npm install
npm start
```

Include the `data/` folder if you want them to have your current data.

---

## Troubleshooting

- **`Port ... already in use`** — the app (or an old copy) is already running.
  Close the other terminal, or stop whatever is using ports **5173 / 5174**.
- **Blank page / no data** — make sure `npm start` (not just `npm run dev`) is
  running, so the Excel API on port 5174 is up.

> Note: the app's "today" is fixed to **2026-07-10** (the `TODAY` constant in
> `src/app/App.tsx`) so the sample data lines up. Change that constant if you
> want the 7-day window to track the real date.
