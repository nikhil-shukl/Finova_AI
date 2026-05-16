import React from "react";

const fmt = (n = 0) =>
  n >= 1e5 ? `Rs.${(n / 1e5).toFixed(1)}L` : `Rs.${Math.round(n).toLocaleString("en-IN")}`;

const toneConfig = {
  red: { text: "#b91c1c", bg: "#fee2e2", border: "#ef4444" },
  amber: { text: "#b45309", bg: "#fef3c7", border: "#f59e0b" },
  green: { text: "#047857", bg: "#d1fae5", border: "#10b981" },
  blue: { text: "#2563eb", bg: "#dbeafe", border: "#3b82f6" },
};

const FutureProjections = ({ portfolio = [] }) => {
  const holdings = [...portfolio].filter((item) => item.currentValue > 0);
  if (!holdings.length) return null;

  const total = holdings.reduce((sum, item) => sum + item.currentValue, 0);
  const biggest = [...holdings].sort((a, b) => b.currentValue - a.currentValue)[0];
  const weakest = [...holdings].sort((a, b) => a.pnlPct - b.pnlPct)[0];
  const strongest = [...holdings].sort((a, b) => b.pnlPct - a.pnlPct)[0];
  const assetClasses = new Set(holdings.map((item) => item.assetClass));
  const concentrationPct = biggest ? (biggest.currentValue / total) * 100 : 0;

  const rows = [
    {
      tone: concentrationPct > 35 ? "amber" : "blue",
      title: `${biggest.assetName} is ${concentrationPct.toFixed(1)}% of portfolio`,
      sub: concentrationPct > 35
        ? "This is a concentrated position. Set a target allocation before buying more."
        : "Largest holding is within a manageable range based on uploaded values.",
      tag: concentrationPct > 35 ? "Review" : "Balanced",
      pnl: biggest.pnl,
    },
    {
      tone: weakest.pnlPct < 0 ? "red" : "green",
      title: weakest.pnlPct < 0 ? `${weakest.assetName} needs attention` : "No loss leader detected",
      sub: weakest.pnlPct < 0
        ? `Down ${Math.abs(weakest.pnlPct).toFixed(2)}%. Recheck the thesis before averaging.`
        : "Uploaded prices show every tracked position at or above cost.",
      tag: weakest.pnlPct < 0 ? "Watch" : "Healthy",
      pnl: weakest.pnl,
    },
    {
      tone: "green",
      title: `${strongest.assetName} is working`,
      sub: `Best performer at ${strongest.pnlPct.toFixed(2)}%. Protect gains with a simple rebalance rule.`,
      tag: "Hold",
      pnl: strongest.pnl,
    },
  ];

  const projectionRows = [
    { label: "Stress case", value: total * 0.85, tone: "red", desc: "Assumes a broad 15% mark-down" },
    { label: "Base case", value: total * 1.1, tone: "amber", desc: "Assumes steady compounding" },
    { label: "Optimized", value: total * 1.24, tone: "green", desc: "Assumes periodic rebalancing" },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Portfolio Forward View</h3>
          <p className="mt-1 text-xs text-slate-400">
            Generated from the current holdings shown on this dashboard.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
          {assetClasses.size} asset classes
        </span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {rows.map((row) => {
          const tone = toneConfig[row.tone];
          return (
            <div key={row.title} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{row.title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{row.sub}</p>
                </div>
                <span style={{ background: tone.bg, color: tone.text }} className="rounded-full px-2 py-1 text-[10px] font-bold">
                  {row.tag}
                </span>
              </div>
              <p style={{ color: tone.text }} className="mt-3 text-sm font-bold">
                {row.pnl >= 0 ? "+" : ""}{fmt(row.pnl)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {projectionRows.map((row) => {
          const tone = toneConfig[row.tone];
          return (
            <div key={row.label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{row.label}</p>
              <p style={{ color: tone.text }} className="mt-2 text-lg font-black">{fmt(row.value)}</p>
              <p className="mt-1 text-xs text-slate-500">{row.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FutureProjections;
