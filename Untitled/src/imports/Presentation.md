---
marp: true
theme: default
paginate: true
title: Personal Expense & Budget Planner
size: 16:9
---

<!-- Slide 1 — Title -->

# 💰 Personal Expense & Budget Planner

### A simple, visual way to track daily spending and budgets

<br>

- Web-based dashboard with charts and reports
- All data saved in a **normal Excel file**
- Built with **React, TypeScript, and Node.js**

<br>

*Submitted by: MP Kruthin Kumar  · July 2026*

---

<!-- Slide 2 — Introduction & Problem -->

## Introduction & Problem

**Why this project?**
- People find it hard to track where their money goes each day.
- Plain spreadsheets are flexible but **not visual or interactive**.
- Most finance apps **hide your data** inside their own systems.

**Our solution**
- A clean, animated dashboard that is easy to use.
- Keeps all data in an **open Excel file** you fully own.
- Best of both worlds: a modern app **and** transparent data.

---

<!-- Slide 3 — Objectives -->

## Objectives

- 📊 Show income vs. expenses clearly using **charts and totals**.
- 📝 Let users **add, edit, and delete** transactions easily.
- 🎯 Allow a **monthly budget for each category** with progress tracking.
- 🔍 Provide **search and filters** to find records quickly.
- 💾 Save everything to a **portable Excel file** automatically.
- 🎨 Offer a smooth, **responsive and themeable** experience.

---

<!-- Slide 4 — Features -->

## Key Features

- **Dashboard** — bar, line, and donut charts (7-day / monthly / all-time).
- **Transactions** — add, edit, and delete entries; double-click a row to edit.
- **Budgets** — set a limit per category and see how much is used or left.
- **Search & Filter** — by text, category, or date range.
- **Themes** — dark / light mode and custom chart colors.
- **Live Excel Sync** — every change is written to `expenses.xlsx` instantly.

---

<!-- Slide 5 — Technology Stack -->

## Technology Stack

- **Frontend:** React 18 + TypeScript (built with Vite)
- **Styling & Animation:** Tailwind CSS, Framer Motion, Lucide icons
- **Charts:** custom SVG charts (bar / line / donut)
- **Backend:** Node.js with Express (REST API)
- **Data Storage:** Excel workbook using the `xlsx` library
- **Key point:** *No database needed — the Excel file is the database.*

---

<!-- Slide 6 — Architecture (Flow Chart) -->

## System Architecture

```
 ┌───────────────┐    request /api    ┌────────────────┐   read / write   ┌──────────────────┐
 │   React App   │ ─────────────────▶ │  Express API   │ ───────────────▶ │  expenses.xlsx   │
 │  (Dashboard)  │ ◀───────────────── │   (Server)     │ ◀─────────────── │  (Excel file)    │
 │  Port 5173    │      JSON data     │   Port 5174    │     saved rows   │   Data storage   │
 └───────────────┘                    └────────────────┘                  └──────────────────┘
```

- The **dashboard** shows data and sends user actions to the server.
- The **server** handles all reading and writing of the Excel file.
- The **Excel file** stores every transaction and budget safely.

---

<!-- Slide 7 — How It Works (Flow Chart) -->

## How It Works — Data Flow

```
        User does an action (Add / Edit / Delete)
                        │
                        ▼
        Screen updates instantly (fast feedback)
                        │
                        ▼
        Request sent to the server  (/api/...)
                        │
                        ▼
        Server updates and saves the Excel file
                        │
                        ▼
             ┌────────── Saved OK? ──────────┐
           Yes │                             │ No
               ▼                             ▼
        Show confirmed data          Reload data from Excel
               │                             │
               └─────────────┬───────────────┘
                             ▼
                          Done ✓
```

---

<!-- Slide 8 — Screenshot -->

## The Application

![w:880](docs/screenshots/overview.png)

- **Top:** balance, income, and expenses at a glance.
- **Left:** interactive chart of spending over time.
- **Right:** category breakdown and recent transactions.

---

<!-- Slide 9 — Testing & Conclusion -->

## Testing, Benefits & Conclusion

**Testing**
- Verified all features end-to-end (add, edit, delete, budgets, themes).
- No errors found; clean production build.

**Benefits**
- Simple setup (`npm install` → `npm start`), transparent Excel data.

**Future scope**
- Recurring entries · CSV/PDF export · cloud sync · user accounts.

<br>

### ✅ A visual, easy-to-use planner that keeps your data open and yours.

# Thank You 🙌
