// ─── Excel-backed API server ──────────────────────────────────────────────
// A tiny Express server that uses a real .xlsx file on disk as its database.
// The workbook data/expenses.xlsx has two sheets:
//   • "Expenses" — id | description | amount | category | date | type
//   • "Budgets"  — category | budget
// You can open/edit it in Microsoft Excel / Google Sheets at any time.

import express from "express";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "expenses.xlsx");
const EXP_SHEET = "Expenses";
const BUD_SHEET = "Budgets";
const EXP_HEADER = ["id", "description", "amount", "category", "date", "type"];
const BUD_HEADER = ["category", "budget"];
const PORT = process.env.PORT || 5174;

// The six spendable categories (income has no budget).
const BUDGET_CATEGORIES = ["food", "transport", "housing", "health", "entertainment", "shopping"];

// Initial rows written the first time the workbook is created (amounts in ₹).
const SEED_EXPENSES = [
  { id: 1,  description: "Grocery run — BigBasket", amount: 2450.75, category: "food",          date: "2026-07-10", type: "expense" },
  { id: 2,  description: "Metro monthly pass",       amount: 1500,    category: "transport",     date: "2026-07-09", type: "expense" },
  { id: 3,  description: "Rent — July",              amount: 18000,   category: "housing",       date: "2026-07-04", type: "expense" },
  { id: 4,  description: "Salary — July 1st",        amount: 75000,   category: "income",        date: "2026-07-04", type: "income"  },
  { id: 5,  description: "Netflix + Spotify",        amount: 720,     category: "entertainment", date: "2026-07-09", type: "expense" },
  { id: 6,  description: "Doctor consultation",      amount: 800,     category: "health",        date: "2026-07-05", type: "expense" },
  { id: 7,  description: "Lunch — cafe",             amount: 480,     category: "food",          date: "2026-07-08", type: "expense" },
  { id: 8,  description: "Online shopping order",    amount: 1899,    category: "shopping",      date: "2026-07-07", type: "expense" },
  { id: 9,  description: "Freelance invoice #14",    amount: 15000,   category: "income",        date: "2026-07-06", type: "income"  },
  { id: 10, description: "Cab — airport",            amount: 640,     category: "transport",     date: "2026-07-04", type: "expense" },
  { id: 11, description: "Grocery top-up",           amount: 1260,    category: "food",          date: "2026-07-06", type: "expense" },
  { id: 12, description: "Cinema tickets",           amount: 700,     category: "entertainment", date: "2026-07-09", type: "expense" },
];

const SEED_BUDGETS = {
  food: 12000,
  transport: 4000,
  housing: 20000,
  health: 3000,
  entertainment: 4000,
  shopping: 6000,
};

/* ─── Excel helpers ───────────────────────────────────────────────────────── */
// Write the whole workbook (both sheets) at once. Serialized to a buffer and
// written with Node's fs — XLSX.writeFile/readFile aren't reliable in ESM.
function writeWorkbook(expenses, budgets) {
  const expWs = XLSX.utils.json_to_sheet(expenses, { header: EXP_HEADER });
  const budRows = BUDGET_CATEGORIES.map((category) => ({ category, budget: Number(budgets[category] ?? 0) }));
  const budWs = XLSX.utils.json_to_sheet(budRows, { header: BUD_HEADER });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, expWs, EXP_SHEET);
  XLSX.utils.book_append_sheet(wb, budWs, BUD_SHEET);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  fs.writeFileSync(FILE, buf);
}

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) {
    writeWorkbook(SEED_EXPENSES, SEED_BUDGETS);
    console.log(`Created ${FILE} with ${SEED_EXPENSES.length} expenses and ${BUDGET_CATEGORIES.length} budgets.`);
  }
}

function workbook() {
  return XLSX.read(fs.readFileSync(FILE), { type: "buffer" });
}

function readExpenses(wb = workbook()) {
  const ws = wb.Sheets[EXP_SHEET] || wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws).map((r) => ({
    id: Number(r.id),
    description: String(r.description ?? ""),
    amount: Number(r.amount),
    category: String(r.category),
    date: String(r.date),
    type: r.type === "income" ? "income" : "expense",
  }));
}

function readBudgets(wb = workbook()) {
  const ws = wb.Sheets[BUD_SHEET];
  const out = { ...SEED_BUDGETS };
  if (ws) {
    for (const r of XLSX.utils.sheet_to_json(ws)) {
      if (r.category != null) out[String(r.category)] = Number(r.budget) || 0;
    }
  }
  return out;
}

// Newest first: by date desc, then id desc — matches the app's "recent" ordering.
function sorted(rows) {
  return [...rows].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
}

/* ─── Server ──────────────────────────────────────────────────────────────── */
ensureFile();

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, file: FILE }));

/* Expenses */
app.get("/api/expenses", (_req, res) => {
  try {
    res.json(sorted(readExpenses()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read Excel file" });
  }
});

app.post("/api/expenses", (req, res) => {
  try {
    const { description, amount, category, date, type } = req.body ?? {};
    if (!description || amount == null || !category || !date || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const wb = workbook();
    const rows = readExpenses(wb);
    const budgets = readBudgets(wb);
    const id = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    const record = {
      id,
      description: String(description),
      amount: Number(amount),
      category: String(category),
      date: String(date),
      type: type === "income" ? "income" : "expense",
    };
    writeWorkbook([...rows, record], budgets);
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to write Excel file" });
  }
});

app.put("/api/expenses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const { description, amount, category, date, type } = req.body ?? {};
    if (!description || amount == null || !category || !date || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const wb = workbook();
    const rows = readExpenses(wb);
    const budgets = readBudgets(wb);
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    const record = {
      id,
      description: String(description),
      amount: Number(amount),
      category: String(category),
      date: String(date),
      type: type === "income" ? "income" : "expense",
    };
    rows[idx] = record;
    writeWorkbook(rows, budgets);
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to write Excel file" });
  }
});

app.delete("/api/expenses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const wb = workbook();
    const rows = readExpenses(wb);
    const budgets = readBudgets(wb);
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return res.status(404).json({ error: "Not found" });
    writeWorkbook(next, budgets);
    res.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to write Excel file" });
  }
});

/* Budgets */
app.get("/api/budgets", (_req, res) => {
  try {
    res.json(readBudgets());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read Excel file" });
  }
});

app.put("/api/budgets/:category", (req, res) => {
  try {
    const category = String(req.params.category);
    if (!BUDGET_CATEGORIES.includes(category)) return res.status(404).json({ error: "Unknown category" });
    const value = Number(req.body?.budget);
    if (!Number.isFinite(value) || value < 0) return res.status(400).json({ error: "Invalid budget" });
    const wb = workbook();
    const expenses = readExpenses(wb);
    const budgets = readBudgets(wb);
    budgets[category] = value;
    writeWorkbook(expenses, budgets);
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to write Excel file" });
  }
});

app.listen(PORT, () => {
  console.log(`Excel API server running on http://localhost:${PORT}`);
  console.log(`Data file: ${FILE}`);
});
