import { useState, useEffect, useCallback, CSSProperties } from "react";

// ── PALETTE ──────────────────────────────────────────────
const C = {
  bg: "#F8F7F5",
  card: "#EDE9E3",
  white: "#FFFFFF",
  navy: "#102937",
  teal: "#124D54",
  coral: "#F9744B",
  border: "#DDD7CF",
  muted: "#8B9BA4",
};

// ── SHARED STYLES ─────────────────────────────────────────
const S: Record<string, CSSProperties> = {
  slide: {
    position: "absolute", inset: 0,
    background: C.bg,
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex", flexDirection: "column",
    padding: "clamp(28px,4.5%,56px)",
    paddingBottom: 0,
    overflow: "hidden",
  },
  slideHead: {
    borderBottom: `1px solid ${C.border}`,
    paddingBottom: "clamp(10px,1.5vw,16px)",
    marginBottom: "clamp(12px,2vw,20px)",
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    flexShrink: 0,
  },
  tag: {
    fontSize: "clamp(8px,0.9vw,10px)", fontWeight: 700, color: C.coral,
    letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 4,
  },
  title: {
    fontSize: "clamp(20px,3.2vw,40px)", fontWeight: 800,
    color: C.navy, letterSpacing: "-0.03em", lineHeight: 1.1,
  },
  body: { fontSize: "clamp(10px,1.1vw,13px)", color: C.navy, opacity: 0.82, lineHeight: 1.6 },
  card: {
    background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
  },
  footer: {
    position: "absolute" as const, bottom: 0, left: 0, right: 0,
    height: 40, display: "flex", alignItems: "center",
    padding: "0 clamp(20px,4%,56px)", justifyContent: "space-between",
    borderTop: `1px solid ${C.border}`,
    background: C.bg, zIndex: 10,
  },
  footerBrand: {
    fontSize: "clamp(8px,0.9vw,11px)", fontWeight: 600,
    color: C.teal, letterSpacing: "0.08em", textTransform: "uppercase" as const, opacity: 0.7,
  },
  footerNum: { fontSize: "clamp(8px,0.9vw,11px)", color: C.muted, fontWeight: 500 },
  coral: { color: C.coral, fontWeight: 700 },
};

// ── SUB-COMPONENTS ────────────────────────────────────────
function SlideHeader({ tag, title }: { tag: string; title: string }) {
  return (
    <div style={S.slideHead}>
      <div>
        <div style={S.tag}>{tag}</div>
        <div style={S.title}>{title}</div>
      </div>
    </div>
  );
}

function Footer({ num, total }: { num: number; total: number }) {
  return (
    <div style={S.footer}>
      <span style={S.footerBrand}>Personal Expense &amp; Budget Planner</span>
      <span style={S.footerNum}>{String(num).padStart(2, "0")} / {total}</span>
    </div>
  );
}

function BulletDot({ color = C.coral }: { color?: string }) {
  return <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 7 }} />;
}

// ══════════════════════════════════════════════════════════
// SLIDES
// ══════════════════════════════════════════════════════════

function Slide1() {
  return (
    <div style={{ ...S.slide, justifyContent: "space-between" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: "clamp(130px,20vw,260px)" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(249,116,75,0.1)", border: "1px solid rgba(249,116,75,0.25)",
          padding: "5px 14px", borderRadius: 100, width: "fit-content",
          fontSize: "clamp(8px,0.9vw,11px)", fontWeight: 600, color: C.coral,
          letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
        }}>University Project · July 2026</div>

        <div style={{ fontSize: "clamp(28px,5.5vw,70px)", fontWeight: 900, color: C.navy, letterSpacing: "-0.04em", lineHeight: 1.0 }}>
          Personal Expense<br />&amp; Budget<br />Planner
        </div>
        <div style={{ fontSize: "clamp(12px,1.5vw,18px)", color: C.teal, fontWeight: 400, marginTop: 14, opacity: 0.85 }}>
          A simple, visual way to track daily spending and budgets
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 }}>
          {["Web Dashboard with Charts", "Excel File Storage", "React + TypeScript + Node.js"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 14px", fontSize: "clamp(9px,1vw,12px)", fontWeight: 500, color: C.navy }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.coral }} />
              {t}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: "clamp(9px,1vw,12px)", color: C.muted, display: "flex", alignItems: "center", gap: 14, paddingTop: 18, borderTop: `1px solid ${C.border}`, marginBottom: 50 }}>
        <span><strong style={{ color: C.navy }}>Submitted by:</strong> MP Kruthin Kumar</span>
        <span style={{ color: C.border }}>|</span>
        <span>July 2026</span>
      </div>

      {/* Decorative SVG */}
      <div style={{ position: "absolute", right: "clamp(16px,5%,72px)", top: "50%", transform: "translateY(-50%)", width: "clamp(120px,17vw,230px)" }}>
        <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <circle cx="120" cy="120" r="110" stroke={C.border} strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="120" cy="120" r="80" stroke={C.border} strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="120" cy="120" r="50" fill="rgba(249,116,75,0.08)" stroke="rgba(249,116,75,0.2)" strokeWidth="1.5" />
          <text x="120" y="132" textAnchor="middle" fontSize="38" fontFamily="Inter,sans-serif">💰</text>
          <circle cx="198" cy="72" r="22" fill={C.white} stroke={C.border} strokeWidth="1" />
          <text x="198" y="69" textAnchor="middle" fontSize="8" fill={C.teal} fontFamily="Inter,sans-serif" fontWeight="700">INCOME</text>
          <text x="198" y="80" textAnchor="middle" fontSize="10" fill={C.coral} fontFamily="Inter,sans-serif" fontWeight="800">+48%</text>
          <circle cx="42" cy="168" r="22" fill={C.white} stroke={C.border} strokeWidth="1" />
          <text x="42" y="165" textAnchor="middle" fontSize="8" fill={C.teal} fontFamily="Inter,sans-serif" fontWeight="700">SAVED</text>
          <text x="42" y="176" textAnchor="middle" fontSize="10" fill={C.navy} fontFamily="Inter,sans-serif" fontWeight="800">₹12k</text>
        </svg>
      </div>

      <Footer num={1} total={10} />
    </div>
  );
}

function Slide2() {
  return (
    <div style={S.slide}>
      <SlideHeader tag="Context" title="Introduction & Problem" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1, paddingBottom: 48 }}>
        {/* Problem card */}
        <div style={{ ...S.card, padding: "clamp(14px,2.2vw,26px)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: "clamp(12px,1.4vw,16px)", color: C.navy }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚠️</div>
            Why This Project?
          </div>
          <div style={{ height: 1, background: C.border }} />
          {["People find it hard to track where their money goes each day.", "Plain spreadsheets are flexible but not visual or interactive.", "Most finance apps hide your data inside their own systems."].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", ...S.body }}>
              <BulletDot color="#ef4444" />{t}
            </div>
          ))}
          <div style={{ marginTop: "auto", background: "rgba(239,68,68,0.05)", borderRadius: 8, padding: "10px 12px", borderLeft: "3px solid #ef4444" }}>
            <div style={{ fontSize: "clamp(8px,0.9vw,10px)", color: "#ef4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>The Gap</div>
            <div style={{ ...S.body }}>No tool offers <strong>beautiful visualisation</strong> while keeping data fully <strong>open and portable</strong>.</div>
          </div>
        </div>
        {/* Solution card */}
        <div style={{ ...S.card, padding: "clamp(14px,2.2vw,26px)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: "clamp(12px,1.4vw,16px)", color: C.navy }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(18,77,84,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✅</div>
            Our Solution
          </div>
          <div style={{ height: 1, background: C.border }} />
          {["A clean, animated dashboard that is easy to use.", "Keeps all data in an open Excel file you fully own.", "Best of both worlds: a modern app and transparent data."].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", ...S.body }}>
              <BulletDot color={C.teal} />{t}
            </div>
          ))}
          <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
            {[["100%", "Data Ownership"], ["0", "DB Needed"]].map(([val, lbl]) => (
              <div key={lbl} style={{ flex: 1, background: "rgba(18,77,84,0.06)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(20px,2.8vw,36px)", fontWeight: 900, color: C.coral }}>{val}</div>
                <div style={{ fontSize: "clamp(8px,0.9vw,11px)", color: C.teal, fontWeight: 600 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer num={2} total={10} />
    </div>
  );
}

function Slide3() {
  const objectives = [
    { n: "01", icon: "📊", title: "Visual Income vs Expenses", desc: "Show income vs. expenses clearly using charts and totals." },
    { n: "02", icon: "📝", title: "Transaction Management", desc: "Add, edit, and delete transactions easily." },
    { n: "03", icon: "🎯", title: "Budget Tracking", desc: "Monthly budget per category with progress tracking." },
    { n: "04", icon: "🔍", title: "Search & Filter", desc: "Search and filters to find records quickly." },
    { n: "05", icon: "💾", title: "Portable Excel Storage", desc: "Save everything to a portable Excel file automatically." },
    { n: "06", icon: "🎨", title: "Responsive & Themeable", desc: "Smooth, responsive, and themeable experience." },
  ];
  return (
    <div style={S.slide}>
      <SlideHeader tag="Goals" title="Objectives" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, flex: 1, paddingBottom: 48 }}>
        {objectives.map(o => (
          <div key={o.n} style={{ ...S.card, padding: "clamp(12px,1.8vw,20px)", display: "flex", flexDirection: "column", gap: 6, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 8, right: 12, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 900, color: "rgba(249,116,75,0.1)", lineHeight: 1 }}>{o.n}</div>
            <div style={{ fontSize: "clamp(18px,2.2vw,26px)" }}>{o.icon}</div>
            <div style={{ fontSize: "clamp(11px,1.2vw,14px)", fontWeight: 700, color: C.navy, lineHeight: 1.3 }}>{o.title}</div>
            <div style={{ ...S.body }}>{o.desc}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: C.coral, borderRadius: "0 0 12px 12px", opacity: 0.5 }} />
          </div>
        ))}
      </div>
      <Footer num={3} total={10} />
    </div>
  );
}

function FeatureIcon({ path }: { path: string }) {
  return (
    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(18,77,84,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, flexShrink: 0 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.8" dangerouslySetInnerHTML={{ __html: path }} />
    </div>
  );
}

function Slide4() {
  const features = [
    { icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 16L10 12L13 14L17 9"/>', name: "Dashboard", desc: "Bar, line, and donut charts for 7-day, monthly, and all-time views.", tag: "Charts" },
    { icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>', name: "Transactions", desc: "Add, edit, and delete entries. Double-click a row to edit inline.", tag: "Core" },
    { icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>', name: "Budgets", desc: "Set a limit per category and track how much is used or left.", tag: "Planning" },
    { icon: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>', name: "Search & Filter", desc: "Filter by text, category, or date range to find any record.", tag: "Utility" },
    { icon: '<circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3"/>', name: "Themes", desc: "Dark / light mode toggle with custom chart color palettes.", tag: "UX" },
    { icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><path d="M9 13h6M9 17h4"/>', name: "Live Excel Sync", desc: "Every change written to expenses.xlsx instantly.", tag: "Storage" },
  ];
  return (
    <div style={S.slide}>
      <SlideHeader tag="Capabilities" title="Key Features" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, flex: 1, paddingBottom: 48 }}>
        {features.map(f => (
          <div key={f.name} style={{ ...S.card, padding: "clamp(12px,1.8vw,20px)", display: "flex", flexDirection: "column", gap: 4 }}>
            <FeatureIcon path={f.icon} />
            <div style={{ fontSize: "clamp(11px,1.2vw,14px)", fontWeight: 700, color: C.navy }}>{f.name}</div>
            <div style={{ ...S.body, flex: 1 }}>{f.desc}</div>
            <div style={{ marginTop: 8, display: "inline-block", background: "rgba(249,116,75,0.08)", color: C.coral, fontSize: "clamp(8px,0.85vw,10px)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 100, width: "fit-content" }}>{f.tag}</div>
          </div>
        ))}
      </div>
      <Footer num={4} total={10} />
    </div>
  );
}

function Slide5() {
  return (
    <div style={S.slide}>
      <SlideHeader tag="Engineering" title="Technology Stack" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, flex: 1, paddingBottom: 48, alignContent: "start" }}>
        {/* Frontend */}
        <div style={{ ...S.card, padding: "clamp(12px,1.8vw,20px)" }}>
          <div style={{ fontSize: "clamp(8px,0.9vw,10px)", fontWeight: 700, color: C.teal, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>⬛ Frontend</div>
          {[["Framework", "React 18 + TypeScript (Vite)"], ["Styling", "Tailwind CSS"], ["Animation", "Framer Motion"], ["Icons", "Lucide React"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid rgba(221,215,207,0.5)`, fontSize: "clamp(9px,1vw,12px)" }}>
              <span style={{ fontWeight: 600, color: C.navy, minWidth: 70 }}>{l}</span>
              <span style={{ color: C.navy, opacity: 0.7 }}>{v}</span>
            </div>
          ))}
        </div>
        {/* Backend */}
        <div style={{ ...S.card, padding: "clamp(12px,1.8vw,20px)" }}>
          <div style={{ fontSize: "clamp(8px,0.9vw,10px)", fontWeight: 700, color: C.teal, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>⚙️ Backend</div>
          {[["Runtime", "Node.js + Express"], ["API", "REST (Port 5174)"], ["Storage", "xlsx library"], ["Format", "Excel Workbook (.xlsx)"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid rgba(221,215,207,0.5)`, fontSize: "clamp(9px,1vw,12px)" }}>
              <span style={{ fontWeight: 600, color: C.navy, minWidth: 70 }}>{l}</span>
              <span style={{ color: C.navy, opacity: 0.7 }}>{v}</span>
            </div>
          ))}
        </div>
        {/* Charts */}
        <div style={{ ...S.card, padding: "clamp(12px,1.8vw,20px)" }}>
          <div style={{ fontSize: "clamp(8px,0.9vw,10px)", fontWeight: 700, color: C.teal, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>📊 Visualisation</div>
          {[["Bar Chart", "Custom SVG"], ["Line Chart", "Custom SVG"], ["Donut", "Custom SVG"], ["Build", "Vite (Port 5173)"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid rgba(221,215,207,0.5)`, fontSize: "clamp(9px,1vw,12px)" }}>
              <span style={{ fontWeight: 600, color: C.navy, minWidth: 70 }}>{l}</span>
              <span style={{ color: C.navy, opacity: 0.7 }}>{v}</span>
            </div>
          ))}
        </div>
        {/* Key callout */}
        <div style={{ gridColumn: "1 / -1", background: "rgba(18,77,84,0.06)", border: "1px solid rgba(18,77,84,0.18)", borderRadius: 10, padding: "clamp(10px,1.5vw,16px) clamp(14px,2vw,22px)", display: "flex", alignItems: "center", gap: 12, fontSize: "clamp(10px,1.2vw,14px)", fontWeight: 500, color: C.teal }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span><strong style={{ color: C.coral }}>Key Point:</strong> No database needed — the Excel file <em>is</em> the database. Zero infrastructure overhead.</span>
        </div>
      </div>
      <Footer num={5} total={10} />
    </div>
  );
}

function ArchBox({ icon, title, port, desc, portColor = C.coral, portBg = "rgba(249,116,75,0.08)", highlight = false }: { icon: string; title: string; port: string; desc: string; portColor?: string; portBg?: string; highlight?: boolean }) {
  return (
    <div style={{ ...S.card, borderColor: highlight ? C.coral : C.border, padding: "clamp(12px,1.8vw,22px) clamp(14px,2vw,26px)", textAlign: "center", flex: 1, maxWidth: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: highlight ? "rgba(249,116,75,0.1)" : "rgba(18,77,84,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
      <div style={{ fontSize: "clamp(12px,1.4vw,16px)", fontWeight: 700, color: C.navy }}>{title}</div>
      <div style={{ fontSize: "clamp(8px,0.9vw,11px)", fontWeight: 600, color: portColor, background: portBg, padding: "3px 10px", borderRadius: 100 }}>{port}</div>
      <div style={{ fontSize: "clamp(9px,1vw,12px)", color: C.muted, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function ArrowBidi({ label1, label2 }: { label1: string; label2: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <div style={{ fontSize: "clamp(7px,0.8vw,9px)", fontWeight: 600, color: C.coral, background: "rgba(249,116,75,0.07)", borderRadius: 6, padding: "3px 6px", textAlign: "center", maxWidth: 80 }}>{label1}</div>
      <svg width="56" height="22" viewBox="0 0 56 22">
        <path d="M2 8 H50" stroke={C.coral} strokeWidth="2" />
        <path d="M50 2L56 8L50 14" stroke={C.coral} strokeWidth="2" fill="none" />
      </svg>
      <svg width="56" height="22" viewBox="0 0 56 22">
        <path d="M54 8 H6" stroke={C.teal} strokeWidth="2" />
        <path d="M6 2L0 8L6 14" stroke={C.teal} strokeWidth="2" fill="none" />
      </svg>
      <div style={{ fontSize: "clamp(7px,0.8vw,9px)", fontWeight: 600, color: C.teal, background: "rgba(18,77,84,0.07)", borderRadius: 6, padding: "3px 6px", textAlign: "center", maxWidth: 80 }}>{label2}</div>
    </div>
  );
}

function Slide6() {
  return (
    <div style={S.slide}>
      <SlideHeader tag="Design" title="System Architecture" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(8px,2vw,20px)", paddingBottom: 60 }}>
        <ArchBox icon="⚛️" title="React App" port="Port 5173" desc="Dashboard UI with charts, tables, and forms" highlight />
        <ArrowBidi label1="request /api" label2="JSON data" />
        <ArchBox icon="🖥️" title="Express API" port="Port 5174" desc="Handles all read & write operations" portColor={C.teal} portBg="rgba(18,77,84,0.08)" />
        <ArrowBidi label1="read / write" label2="saved rows" />
        <ArchBox icon="📄" title="expenses.xlsx" port="Data Storage" desc="Single Excel file storing every transaction & budget" portColor={C.navy} portBg="rgba(16,41,55,0.08)" />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 48 }}>
        {["🖥️ Dashboard shows data and sends user actions to the server.", "⚙️ Server handles all reading and writing of the Excel file.", "📄 Excel file stores every transaction and budget safely."].map(t => (
          <div key={t} style={{ flex: 1, background: "rgba(18,77,84,0.05)", borderRadius: 8, padding: "8px 12px", fontSize: "clamp(9px,1vw,12px)", color: C.navy, opacity: 0.8, lineHeight: 1.4 }}>{t}</div>
        ))}
      </div>
      <Footer num={6} total={10} />
    </div>
  );
}

function Slide7() {
  const steps = [
    { label: "1", coral: true, title: "User performs an action", desc: "Add, Edit, or Delete a transaction" },
    { label: "2", coral: false, title: "Screen updates instantly", desc: "Optimistic UI update — fast feedback to the user" },
    { label: "3", coral: false, title: "Request sent to server", desc: "REST call to /api/... on Port 5174" },
    { label: "4", coral: false, title: "Server updates Excel file", desc: "xlsx library writes changes to expenses.xlsx" },
  ];
  return (
    <div style={S.slide}>
      <SlideHeader tag="Process" title="How It Works — Data Flow" />
      <div style={{ flex: 1, display: "flex", gap: 16, paddingBottom: 48 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {steps.map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 36 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.coral ? C.coral : C.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(11px,1.2vw,14px)", fontWeight: 700, flexShrink: 0 }}>{s.label}</div>
                {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 16, background: C.border }} />}
              </div>
              <div style={{ ...S.card, padding: "10px 14px", marginBottom: 8, flex: 1 }}>
                <div style={{ fontSize: "clamp(11px,1.2vw,14px)", fontWeight: 700, color: C.navy }}>{s.title}</div>
                <div style={{ fontSize: "clamp(9px,1vw,12px)", color: C.muted, marginTop: 2 }}>{s.desc}</div>
              </div>
            </div>
          ))}
          {/* Branch */}
          <div style={{ display: "flex", gap: 10, paddingLeft: 50, marginBottom: 8 }}>
            {[{ ok: true, label: "✓ Saved OK", text: "Show confirmed data — dashboard reflects persisted state" }, { ok: false, label: "✗ Error", text: "Reload data from Excel — revert to last known good state" }].map(b => (
              <div key={b.label} style={{ flex: 1, ...S.card, borderLeft: `3px solid ${b.ok ? C.teal : C.coral}`, padding: "10px 14px" }}>
                <div style={{ fontSize: "clamp(8px,0.9vw,10px)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: b.ok ? C.teal : C.coral, marginBottom: 3 }}>{b.label}</div>
                <div style={{ ...S.body }}>{b.text}</div>
              </div>
            ))}
          </div>
          {/* Done */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.coral, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(11px,1.2vw,14px)", fontWeight: 700, flexShrink: 0 }}>✓</div>
            <div style={{ ...S.card, borderColor: "rgba(249,116,75,0.3)", background: "rgba(249,116,75,0.04)", padding: "10px 14px", flex: 1 }}>
              <div style={{ fontSize: "clamp(11px,1.2vw,14px)", fontWeight: 700, color: C.coral }}>Done — Data persisted safely</div>
              <div style={{ fontSize: "clamp(9px,1vw,12px)", color: C.muted, marginTop: 2 }}>UI and Excel file are always in sync</div>
            </div>
          </div>
        </div>
      </div>
      <Footer num={7} total={10} />
    </div>
  );
}

function Slide8() {
  const barHeights = [45, 62, 30, 75, 50, 88, 40];
  return (
    <div style={S.slide}>
      <SlideHeader tag="UI Preview" title="The Application" />
      <div style={{ display: "flex", gap: 14, flex: 1, paddingBottom: 48, alignItems: "stretch" }}>
        {/* Mock panels */}
        <div style={{ flex: 2, display: "flex", gap: 10 }}>
          {/* Main */}
          <div style={{ flex: 2, background: C.navy, borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginLeft: 8, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" }}>Expense Planner · Dashboard</span>
            </div>
            <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[["Total Balance", "₹48,200", C.coral], ["Income", "₹75,000", "#4ade80"], ["Expenses", "₹26,800", "#f87171"]].map(([lbl, val, col]) => (
                  <div key={lbl as string} style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>{lbl}</div>
                    <div style={{ fontSize: "clamp(12px,1.6vw,18px)", fontWeight: 800, color: col as string, marginTop: 3, fontFamily: "'Inter',sans-serif" }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>Spending — Last 7 Days</div>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 4, justifyContent: "space-between", paddingTop: 6 }}>
                  {barHeights.map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: i % 2 === 0 ? "rgba(249,116,75,0.55)" : "rgba(18,77,84,0.7)", borderRadius: "3px 3px 0 0" }} />)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d} style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter',sans-serif" }}>{d}</span>)}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>Recent Transactions</div>
                {[["🍔", "Food & Dining", "-₹1,200", "#f87171"], ["💼", "Salary", "+₹75,000", "#4ade80"], ["🚌", "Transport", "-₹450", "#f87171"]].map(([icon, name, amt, col]) => (
                  <div key={name as string} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "5px 8px", marginBottom: 4 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{icon}</div>
                    <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.75)", flex: 1, fontFamily: "'Inter',sans-serif" }}>{name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: col as string, fontFamily: "'Inter',sans-serif" }}>{amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Side */}
          <div style={{ flex: 1, background: C.navy, borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 14px" }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" }}>Categories</span>
            </div>
            <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>Breakdown</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle cx="45" cy="45" r="36" fill="none" stroke={C.coral} strokeWidth="12" strokeDasharray="80 146" strokeDashoffset="0" strokeLinecap="round" />
                  <circle cx="45" cy="45" r="36" fill="none" stroke={C.teal} strokeWidth="12" strokeDasharray="50 176" strokeDashoffset="-80" strokeLinecap="round" />
                  <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" strokeDasharray="30 196" strokeDashoffset="-130" strokeLinecap="round" />
                  <text x="45" y="49" textAnchor="middle" fontSize="13" fill="white" fontWeight="800" fontFamily="Inter,sans-serif">36%</text>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[[C.coral, "Food 36%"], [C.teal, "Transport 22%"], ["rgba(255,255,255,0.25)", "Other 42%"]].map(([col, lbl]) => (
                  <div key={lbl as string} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: "rgba(255,255,255,0.7)", fontFamily: "'Inter',sans-serif" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: col as string, flexShrink: 0 }} />{lbl}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto", background: "rgba(249,116,75,0.15)", borderRadius: 6, padding: 8 }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>Budget Used</div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, margin: "4px 0", overflow: "hidden" }}>
                  <div style={{ width: "64%", height: "100%", background: C.coral, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter',sans-serif" }}>64% of ₹42,000</div>
              </div>
            </div>
          </div>
        </div>
        {/* Callouts */}
        <div style={{ flex: 0.55, display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
          <div style={{ fontSize: "clamp(11px,1.2vw,14px)", fontWeight: 700, color: C.navy, marginBottom: 4 }}>What you see:</div>
          {[["T", "Top bar:", "Balance, income, and expenses at a glance."], ["L", "Left panel:", "Interactive bar chart of spending over time."], ["R", "Right panel:", "Category donut chart and budget progress."], ["↓", "Below:", "Recent transactions with edit on double-click."]].map(([badge, lbl, desc]) => (
            <div key={badge as string} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "clamp(9px,1.1vw,13px)", color: C.navy, opacity: 0.82, lineHeight: 1.4 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(249,116,75,0.12)", color: C.coral, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{badge}</div>
              <div><strong>{lbl}</strong> {desc}</div>
            </div>
          ))}
          <div style={{ marginTop: 8, background: "rgba(18,77,84,0.07)", borderRadius: 10, padding: 12, borderLeft: `3px solid ${C.teal}` }}>
            <div style={{ fontSize: "clamp(9px,1.1vw,13px)", color: C.teal, fontWeight: 600, lineHeight: 1.5 }}>All data auto-synced to <code style={{ background: "rgba(249,116,75,0.1)", color: C.coral, padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>expenses.xlsx</code> on every change.</div>
          </div>
        </div>
      </div>
      <Footer num={8} total={10} />
    </div>
  );
}

function Slide9() {
  return (
    <div style={S.slide}>
      <SlideHeader tag="Summary" title="Testing, Benefits & Conclusion" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, paddingBottom: 14 }}>
        {/* Testing */}
        <div style={{ ...S.card, padding: "clamp(12px,1.8vw,20px)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(18,77,84,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧪</div>
            <div style={{ fontSize: "clamp(12px,1.4vw,16px)", fontWeight: 700, color: C.navy }}>Testing</div>
          </div>
          <div style={{ height: 1, background: C.border }} />
          {["Verified all features end-to-end — add, edit, delete, budgets, themes.", "No errors found; clean production build generated."].map(t => (
            <div key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start", ...S.body }}><BulletDot color={C.teal} />{t}</div>
          ))}
          <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
            {[["100%", "Coverage"], ["0", "Errors"]].map(([v, l]) => (
              <div key={l} style={{ flex: 1, background: "rgba(18,77,84,0.06)", borderRadius: 8, padding: 8, textAlign: "center" }}>
                <div style={{ fontSize: "clamp(20px,2.8vw,34px)", fontWeight: 900, color: C.teal }}>{v}</div>
                <div style={{ fontSize: "clamp(8px,0.85vw,10px)", color: C.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Benefits */}
        <div style={{ ...S.card, padding: "clamp(12px,1.8vw,20px)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(249,116,75,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✨</div>
            <div style={{ fontSize: "clamp(12px,1.4vw,16px)", fontWeight: 700, color: C.navy }}>Benefits</div>
          </div>
          <div style={{ height: 1, background: C.border }} />
          {["Simple setup — npm install → npm start", "Transparent Excel data — no vendor lock-in, data fully owned.", "No cloud account, no subscription, works fully offline."].map(t => (
            <div key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start", ...S.body }}><BulletDot />{t}</div>
          ))}
        </div>
        {/* Future */}
        <div style={{ ...S.card, padding: "clamp(12px,1.8vw,20px)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(16,41,55,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚀</div>
            <div style={{ fontSize: "clamp(12px,1.4vw,16px)", fontWeight: 700, color: C.navy }}>Future Scope</div>
          </div>
          <div style={{ height: 1, background: C.border }} />
          {["Recurring entries with auto-scheduling", "CSV & PDF export for reports", "Cloud sync & multi-device access", "User accounts & shared budgets"].map(t => (
            <div key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start", ...S.body }}><BulletDot color={C.muted} />{t}</div>
          ))}
        </div>
      </div>
      {/* Banner */}
      <div style={{ background: C.navy, borderRadius: 10, padding: "clamp(12px,1.8vw,18px) clamp(16px,2.2vw,28px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 48 }}>
        <div style={{ fontSize: "clamp(11px,1.4vw,16px)", fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>
          ✅ A visual, easy-to-use planner that keeps your data <span style={{ color: C.coral }}>open and yours</span>.
        </div>
        <div style={{ background: C.coral, color: "#fff", fontSize: "clamp(10px,1.1vw,12px)", fontWeight: 700, padding: "8px 16px", borderRadius: 8, whiteSpace: "nowrap" }}>
          MP Kruthin Kumar · July 2026
        </div>
      </div>
      <Footer num={9} total={10} />
    </div>
  );
}

function Slide10() {
  return (
    <div style={{ ...S.slide, alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative" }}>
      {/* Decorative circles */}
      {[500, 350, 200].map((sz, i) => (
        <div key={sz} style={{ position: "absolute", width: sz, height: sz, borderRadius: "50%", border: `1px ${i === 2 ? "dashed" : "solid"} ${i === 2 ? "rgba(249,116,75,0.2)" : C.border}`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      ))}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 4, background: C.coral, borderRadius: 2 }} />
        <div style={{ fontSize: "clamp(36px,6vw,80px)" }}>🙌</div>
        <div style={{ fontSize: "clamp(36px,6.5vw,88px)", fontWeight: 900, color: C.navy, letterSpacing: "-0.04em", lineHeight: 1 }}>Thank You</div>
        <div style={{ fontSize: "clamp(13px,1.6vw,20px)", color: C.teal, fontWeight: 400, opacity: 0.85, maxWidth: 500 }}>
          Personal Expense &amp; Budget Planner — a modern, transparent way to manage your finances.
        </div>
        <div style={{ ...S.card, padding: "clamp(12px,1.8vw,20px) clamp(18px,2.8vw,34px)", display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
          <div style={{ fontSize: "clamp(14px,1.6vw,18px)", fontWeight: 700, color: C.navy }}>MP Kruthin Kumar</div>
          <div style={{ fontSize: "clamp(11px,1.2vw,14px)", color: C.muted }}>University Project · July 2026</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {[["React + TypeScript", "rgba(18,77,84,0.08)", C.teal], ["Node.js + Express", "rgba(249,116,75,0.08)", C.coral], ["Excel Storage", "rgba(16,41,55,0.07)", C.navy]].map(([label, bg, color]) => (
            <div key={label as string} style={{ background: bg as string, borderRadius: 10, padding: "8px 16px", fontSize: "clamp(10px,1.1vw,13px)", color: color as string, fontWeight: 500 }}>{label}</div>
          ))}
        </div>
      </div>
      <Footer num={10} total={10} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN DECK
// ══════════════════════════════════════════════════════════

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9, Slide10];
const TOTAL = SLIDES.length;

export default function App() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const goTo = useCallback((n: number) => {
    const clamped = Math.max(0, Math.min(n, TOTAL - 1));
    setCurrent(clamped);
    setAnimKey(k => k + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); goTo(current + 1); }
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")                    { e.preventDefault(); goTo(current - 1); }
      if (e.key === "Home") goTo(0);
      if (e.key === "End")  goTo(TOTAL - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd   = (e: TouchEvent) => { const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1)); };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend",   onEnd);
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [current, goTo]);

  const SlideComponent = SLIDES[current];

  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, height: 3, background: C.coral, width: `${((current + 1) / TOTAL) * 100}%`, transition: "width 0.3s ease", zIndex: 200, borderRadius: "0 2px 2px 0" }} />

      {/* Slide wrapper */}
      <div style={{ position: "relative", width: "min(1280px, 96vw)", aspectRatio: "16/9", overflow: "hidden", borderRadius: 4 }}>
        <div key={animKey} style={{ animation: "fadeUp 0.35s ease forwards", position: "absolute", inset: 0 }}>
          <SlideComponent />
        </div>
      </div>

      {/* Prev arrow */}
      <button onClick={() => goTo(current - 1)} style={{ position: "fixed", left: 14, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", opacity: current === 0 ? 0.3 : 1, transition: "all 0.2s", zIndex: 100, fontFamily: "system-ui" }}
        aria-label="Previous slide">←</button>

      {/* Next arrow */}
      <button onClick={() => goTo(current + 1)} style={{ position: "fixed", right: 14, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", opacity: current === TOTAL - 1 ? 0.3 : 1, transition: "all 0.2s", zIndex: 100, fontFamily: "system-ui" }}
        aria-label="Next slide">→</button>

      {/* Navigation dots */}
      <div style={{ position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 100 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
            style={{ height: 8, width: i === current ? 24 : 8, borderRadius: i === current ? 4 : "50%", background: i === current ? C.coral : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />
        ))}
      </div>

      {/* Hint */}
      <div style={{ position: "fixed", bottom: 50, right: 16, fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter',sans-serif", pointerEvents: "none" }}>
        ← → Arrow keys to navigate
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        html, body { width:100%; height:100%; margin:0; overflow:hidden; }
        button:hover { background: rgba(249,116,75,0.55) !important; }
      `}</style>
    </div>
  );
}
