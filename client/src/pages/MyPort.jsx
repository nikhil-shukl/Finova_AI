import { useState, useEffect } from "react";
import axios from "axios";
import FutureProjections from "../components/FutureProjections";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from "recharts";
import {
  TrendingUp, TrendingDown, Wallet, Target, AlertTriangle,
  Sparkles, RefreshCw, ChevronLeft, ChevronRight, X,
  ShieldAlert, Flame, Clock, Bell, BellOff, BookOpen, Activity, Newspaper
} from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const USER_GMAIL = "vinitskaple@gmail.com";

const GOLD_OVERRIDE_PRICE = 18000 ;

const ASSET_COLORS = {
  Stocks: "#6366f1",
  "Mutual Funds": "#06b6d4",
  ETFs: "#8b5cf6",
  Gold: "#f59e0b",
  FDs: "#10b981",
  Crypto: "#f97316",
};

const SECTOR_COLORS = ["#6366f1","#06b6d4","#f59e0b","#10b981","#f97316","#8b5cf6","#ec4899","#14b8a6"];

const fmt = (n) =>
  n >= 1e7
    ? `₹${(n / 1e7).toFixed(2)}Cr`
    : n >= 1e5
    ? `₹${(n / 1e5).toFixed(2)}L`
    : `₹${n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const ITEMS_PER_PAGE = 5;

const LATEST_NEWS = [
  { headline: "Sensex crashes 1,700 pts; ₹9L Cr investor wealth wiped in single session", tag: "RELIANCE", sentiment: "Negative", source: "ET Markets", time: "Mar 29" },
  { headline: "Infosys acquires Optimum Healthcare IT to accelerate digital health push", tag: "INFY", sentiment: "Positive", source: "Mint", time: "Mar 26" },
  { headline: "Gold surges to ₹1,67,915/10g on MCX as safe haven demand spikes", tag: "SGB2024", sentiment: "Positive", source: "CNBCTV18", time: "Mar 27" },
  { headline: "Nifty Bank down 13.6% in 4 weeks; HDFC Bank under pressure from rising bond yields", tag: "HDFCBANK", sentiment: "Negative", source: "Business Standard", time: "Mar 28" },
  { headline: "Brent crude at $109/barrel after US-Iran tensions; Asian Paints margins at risk", tag: "ASIANPAINT", sentiment: "Negative", source: "Reuters", time: "Mar 27" },
  { headline: "Rupee hits all-time low of 94.82/$; RBI mandates $100M daily NOP cap for banks", tag: "General", sentiment: "Neutral", source: "LiveMint", time: "Mar 29" },
  { headline: "Tech MFs bleed 35–47% in FY26; Quant Technology Fund among worst hit", tag: "QUANT_TECH", sentiment: "Negative", source: "ValueResearch", time: "Mar 28" },
  { headline: "Govt slashes petrol excise duty by ₹10; Reliance hit by windfall tax reinstatement", tag: "RELIANCE", sentiment: "Negative", source: "Financial Express", time: "Mar 27" },
];

function SentimentBadge({ sentiment }) {
  const map = { Positive: "bg-emerald-100 text-emerald-700", Negative: "bg-red-100 text-red-700", Neutral: "bg-slate-100 text-slate-600" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[sentiment]}`}>{sentiment}</span>;
}

// ─── Gold Override Utility ─────────────────────────────────────────────────────
// After fetching from MongoDB, if the refresh flag is active, bump Gold's
// currentPrice to GOLD_OVERRIDE_PRICE and recompute currentValue, pnl, pnlPct.
// Then recompute portfolio-level summary totals so every card stays in sync.
function applyGoldOverride(portfolioData) {
  if (!portfolioData) return portfolioData;

  const holdings = (portfolioData.holdings || []).map((h) => {
    if (h.assetClass !== "Gold") return h;

    const newCurrentPrice = GOLD_OVERRIDE_PRICE;
    const newCurrentValue = newCurrentPrice * h.units;
    const newPnl = newCurrentValue - h.investedAmount;
    const newPnlPct = parseFloat(((newPnl / h.investedAmount) * 100).toFixed(2));

    return {
      ...h,
      currentPrice: newCurrentPrice,
      currentValue: newCurrentValue,
      pnl: newPnl,
      pnlPct: newPnlPct,
    };
  });

  // Recompute summary from updated holdings
  const totalInvested = holdings.reduce((s, h) => s + h.investedAmount, 0);
  const totalCurrent  = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalPnL      = totalCurrent - totalInvested;
  const totalPnLPct   = parseFloat(((totalPnL / totalInvested) * 100).toFixed(2));

  return {
    ...portfolioData,
    holdings,
    summary: {
      ...(portfolioData.summary || {}),
      totalInvested,
      totalCurrent,
      totalPnL,
      totalPnLPct,
    },
  };
}
// ──────────────────────────────────────────────────────────────────────────────

export default function MyPort() {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [risk, setRisk] = useState(null);
  const [smsAlert, setSmsAlert] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingMain, setLoadingMain] = useState(true);
  const [page, setPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [riskAppetite, setRiskAppetite] = useState("Light");
  const [activeTab, setActiveTab] = useState("holdings");
  // Tracks whether the user has clicked refresh (to apply Gold override)
  const [goldOverrideActive, setGoldOverrideActive] = useState(false);

  useEffect(() => {
    fetchAll(false); // initial load — no override
  }, []);

  // ── fetchAll accepts a flag; if true, applies Gold override after fetch ──────
  const fetchAll = async (withOverride = false) => {
    setLoadingMain(true);
    try {
      const [pRes, tRes, rRes] = await Promise.all([
        axios.get(`${BACKEND}/api/portfolio/${encodeURIComponent(USER_GMAIL)}`),
        axios.get(`${BACKEND}/api/portfolio/${encodeURIComponent(USER_GMAIL)}/transactions`),
        axios.get(`${BACKEND}/api/portfolio/${encodeURIComponent(USER_GMAIL)}/risk`),
      ]);

      const rawPortfolio = pRes.data;
      // Apply Gold override only when refresh button is clicked
      const finalPortfolio = withOverride ? applyGoldOverride(rawPortfolio) : rawPortfolio;

      setPortfolio(finalPortfolio);
      setTransactions(tRes.data.transactions);
      setRisk(rRes.data);
      setGoldOverrideActive(withOverride);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMain(false);
    }
  };

  // ── Refresh button handler — always applies Gold override ───────────────────
  const handleRefresh = () => {
    fetchAll(true);
  };

  const toggleSmsAlert = async () => {
    if (smsAlert) {
      setSmsAlert(false);
      return;
    }
    setSendingSms(true);
    try {
      const res = await axios.post(`${BACKEND}/api/sms/alert`);
      if (res.data.success) {
        setSmsAlert(true);
        console.log("SMS sent:", res.data.preview);
      }
    } catch (e) {
      console.error("SMS alert error:", e);
    } finally {
      setSendingSms(false);
    }
  };

  const fetchSuggestions = async () => {
    setLoadingSuggest(true);
    try {
      const res = await axios.post(`${BACKEND}/api/portfolio/${encodeURIComponent(USER_GMAIL)}/suggest`);
      setSuggestions(res.data.suggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggest(false);
    }
  };

  if (loadingMain) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading portfolio…</p>
        </div>
      </div>
    );
  }

  const { user, holdings = [], summary = {} } = portfolio || {};

  const allocationByClass = Object.entries(
    holdings.reduce((acc, h) => {
      acc[h.assetClass] = (acc[h.assetClass] || 0) + h.currentValue;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Math.round(value) }));

  const allocationBySector = Object.entries(
    holdings.reduce((acc, h) => {
      acc[h.sector] = (acc[h.sector] || 0) + h.currentValue;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Math.round(value) }));

  const totalPages = Math.ceil(holdings.length / ITEMS_PER_PAGE);
  const pagedHoldings = holdings.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalTxPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const pagedTx = transactions.slice((txPage - 1) * ITEMS_PER_PAGE, txPage * ITEMS_PER_PAGE);

  const riskColor = risk?.riskScore >= 7 ? "text-red-500" : risk?.riskScore >= 4 ? "text-amber-500" : "text-emerald-500";

  const RISK_OPTIONS = ["Light", "Dark"];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">My Portfolio</p>
          <h1 className="text-lg font-bold text-slate-800">{user?.fullName}</h1>
        </div>
        <div className="flex items-center gap-3">

          {/* SMS Alert Toggle */}
          <button
            onClick={toggleSmsAlert}
            disabled={sendingSms}
            title={smsAlert ? "SMS Alerts ON — click to turn off" : "SMS Alerts OFF — click to send alert"}
            className={`
              flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200
              ${smsAlert
                ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"}
              ${sendingSms ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {sendingSms ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : smsAlert ? (
              <Bell size={14} className="text-emerald-600" />
            ) : (
              <BellOff size={14} />
            )}
            <span className="hidden sm:inline">
              {sendingSms ? "Sending…" : smsAlert ? "SMS ON" : "SMS Alert"}
            </span>
          </button>

          {/* Risk Appetite Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {RISK_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setRiskAppetite(opt)}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all duration-200 ${
                  riskAppetite === opt
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Refresh — now calls handleRefresh to apply Gold override */}
          <button
            onClick={handleRefresh}
            title="Refresh & update Gold price"
            className={`p-2 rounded-lg hover:bg-slate-100 transition ${
              goldOverrideActive ? "text-amber-500" : "text-slate-400"
            }`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Gold price update banner — shown only after refresh */}
        {goldOverrideActive && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
            <span className="text-base">🟡</span>
            Gold price updated to ₹{GOLD_OVERRIDE_PRICE.toLocaleString()} — portfolio recalculated.
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Invested", value: fmt(summary.totalInvested || 0), icon: <Wallet size={18} />, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Current Value", value: fmt(summary.totalCurrent || 0), icon: <Activity size={18} />, color: "text-cyan-600", bg: "bg-cyan-50" },
            {
              label: "Total P&L",
              value: fmt(Math.abs(summary.totalPnL || 0)),
              sub: `${summary.totalPnL >= 0 ? "+" : "-"}${Math.abs(summary.totalPnLPct)}%`,
              icon: summary.totalPnL >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />,
              color: summary.totalPnL >= 0 ? "text-emerald-600" : "text-red-500",
              bg: summary.totalPnL >= 0 ? "bg-emerald-50" : "bg-red-50",
              negative: summary.totalPnL < 0,
            },
            { label: "Risk Score", value: `${risk?.riskScore || "—"}/10`, sub: risk?.riskLabel, icon: <ShieldAlert size={18} />, color: riskColor, bg: "bg-amber-50" },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{card.label}</span>
                <span className={`${card.bg} ${card.color} p-1.5 rounded-lg`}>{card.icon}</span>
              </div>
              <p className={`text-xl font-bold ${card.negative ? "text-red-500" : "text-slate-800"}`}>{card.value}</p>
              {card.sub && <p className={`text-xs mt-0.5 font-medium ${card.color}`}>{card.sub}</p>}
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Donut — Asset Class */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Asset Allocation</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={allocationByClass} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {allocationByClass.map((entry) => (
                      <Cell key={entry.name} fill={ASSET_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1">
                {allocationByClass.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: ASSET_COLORS[entry.name] || "#94a3b8" }} />
                      <span className="text-slate-600 font-medium">{entry.name}</span>
                    </div>
                    <span className="text-slate-500">{fmt(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar — Sector */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Sector Exposure</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={allocationBySector} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {allocationBySector.map((_, i) => (
                    <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabs: Holdings / Transactions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {[
              { id: "holdings", label: "Holdings", icon: <Wallet size={14} /> },
              { id: "transactions", label: "Transactions", icon: <BookOpen size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "holdings" && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Asset", "Class", "Sector", "Units", "Avg Buy", "Current", "Invested", "Value", "P&L", "P&L %"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pagedHoldings.map((h) => (
                      <tr key={h.id} className={`hover:bg-slate-50/60 transition ${goldOverrideActive && h.assetClass === "Gold" ? "bg-amber-50/40" : ""}`}>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{h.assetName}</p>
                          <p className="text-xs text-slate-400">{h.ticker}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-semibold px-2 py-1 rounded-full text-white whitespace-nowrap" style={{ background: ASSET_COLORS[h.assetClass] || "#6366f1" }}>
                            {h.assetClass}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{h.sector}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{h.units}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">₹{h.avgBuyPrice.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-sm font-medium whitespace-nowrap">
                          <span className={goldOverrideActive && h.assetClass === "Gold" ? "text-amber-600 font-bold" : "text-slate-700"}>
                            ₹{h.currentPrice.toLocaleString()}
                            {goldOverrideActive && h.assetClass === "Gold" && (
                              <span className="ml-1 text-[10px] bg-amber-100 text-amber-600 px-1 py-0.5 rounded">↑ updated</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{fmt(h.investedAmount)}</td>
                        <td className="px-4 py-3.5 text-sm font-medium text-slate-700 whitespace-nowrap">{fmt(h.currentValue)}</td>
                        <td className={`px-4 py-3.5 text-sm font-semibold whitespace-nowrap ${h.pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {h.pnl >= 0 ? "+" : ""}{fmt(h.pnl)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${h.pnlPct >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                            {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-white">
                <span className="text-xs text-slate-400">
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, holdings.length)} of {holdings.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 transition">
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-7 h-7 text-xs rounded-md font-medium transition ${pg === page ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>
                      {pg}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 transition">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "transactions" && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Type", "Ticker", "Date", "Units", "Price", "Amount"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pagedTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            tx.type === "Buy" ? "bg-indigo-50 text-indigo-600" :
                            tx.type === "Sell" ? "bg-red-50 text-red-500" :
                            "bg-cyan-50 text-cyan-600"
                          }`}>{tx.type}</span>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{tx.ticker}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-500">{tx.date}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{tx.units}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">₹{tx.price.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{fmt(tx.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Showing {(txPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(txPage * ITEMS_PER_PAGE, transactions.length)} of {transactions.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setTxPage((p) => Math.max(1, p - 1))} disabled={txPage === 1} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 transition">
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalTxPages }, (_, i) => i + 1).map((pg) => (
                    <button key={pg} onClick={() => setTxPage(pg)}
                      className={`w-7 h-7 text-xs rounded-md font-medium transition ${pg === txPage ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>
                      {pg}
                    </button>
                  ))}
                  <button onClick={() => setTxPage((p) => Math.min(totalTxPages, p + 1))} disabled={txPage === totalTxPages} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 transition">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* News Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper size={16} className="text-cyan-500" />
            <h3 className="text-sm font-bold text-slate-700">Portfolio-Relevant News</h3>
            <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full animate-pulse">Live</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LATEST_NEWS.map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition cursor-pointer">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-700 leading-snug mb-1.5">{n.headline}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">{n.tag}</span>
                    <SentimentBadge sentiment={n.sentiment} />
                    <span className="text-[10px] text-slate-400">{n.source} · {n.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <FutureProjections portfolio={holdings} user={user} />

        {/* AI Suggestions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-700">AI Investment Suggestions</h3>
              <span className="text-xs text-slate-400">· Powered by GPT-4o-mini</span>
            </div>
            <button
              onClick={fetchSuggestions}
              disabled={loadingSuggest}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-60"
            >
              {loadingSuggest ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={12} />}
              {loadingSuggest ? "Analyzing…" : "Get Suggestions"}
            </button>
          </div>

          {suggestions.length === 0 && !loadingSuggest && (
            <div className="text-center py-10 text-slate-400">
              <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Click "Get Suggestions" to receive AI-powered recommendations based on your portfolio and current market conditions.</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((s, i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-bold text-slate-800">{s.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.action === "Buy" ? "bg-indigo-50 text-indigo-600" :
                        s.action === "Hold" ? "bg-amber-50 text-amber-600" :
                        "bg-cyan-50 text-cyan-600"
                      }`}>{s.action}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.urgency === "High" ? "bg-red-50 text-red-500" :
                        s.urgency === "Medium" ? "bg-amber-50 text-amber-600" :
                        "bg-slate-100 text-slate-500"
                      }`}>{s.urgency}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">{s.suggestion}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="text-[11px] text-emerald-600 font-semibold">{s.expectedReturn}</span>
                    <span className="text-[10px] text-slate-400 italic">{s.rationale}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 pb-4">Data as of March 28, 2026 · For educational purposes only · SEBI-registered advice</p>
      </div>
    </div>
  );
}