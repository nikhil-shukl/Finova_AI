import React from "react";

const FutureProjections = ({ portfolio = [], user }) => {
  const fmt = (n) =>
    n >= 1e5
      ? `₹${(n / 1e5).toFixed(1)}L`
      : `₹${Math.round(n).toLocaleString("en-IN")}`;

  const p = (ticker) => portfolio.find((x) => x.ticker === ticker) || {};

  const calc = (ticker) => {
    const h = p(ticker);
    const cost = (h.units || 0) * (h.avgBuyPrice || 0);
    const val = (h.units || 0) * (h.currentPrice || 0);
    return { cost, val, pnl: val - cost, pct: cost ? (((val - cost) / cost) * 100).toFixed(1) : "0" };
  };

  const qt  = calc("QUANT_TECH");
  const ap  = calc("ASIANPAINT");
  const sgb = calc("SGB2024");
  const btc = calc("BTC");
  const fd  = p("SBI_FD");
  const fdPnl = (fd.currentPrice || 0) - (fd.avgBuyPrice || 0);

  const total = portfolio.reduce((s, x) => s + x.units * x.currentPrice, 0);

  const clr = { red: "#A32D2D", amber: "#854F0B", green: "#3B6D11" };
  const bg  = { red: "#FCEBEB", amber: "#FAEEDA", green: "#EAF3DE" };
  const border = { red: "#E24B4A", amber: "#BA7517", green: "#639922" };

  const hurting = [
    {
      icon: "↓", tone: "red",
      title: `QUANT_TECH down ${Math.abs(qt.pct)}%`,
      sub: `Put in ${fmt(qt.cost)}, now ${fmt(qt.val)}. Thematic tech is too risky for moderate profile. Another −20% = ${fmt(qt.val * 0.2)} more lost.`,
      tag: "Exit this", pnl: qt.pnl,
    },
    {
      icon: "!", tone: "amber",
      title: "Asian Paints — keep an eye",
      sub: `Crude at $109 hurts paint companies. Down ${fmt(Math.abs(ap.pnl))} so far. No rush, but set a mental stop-loss.`,
      tag: "Watch", pnl: ap.pnl,
    },
  ];

  const working = [
    {
      icon: "↑", tone: "green",
      title: `Gold Bond up ${sgb.pct}%`,
      sub: `Bought ₹6,342 → now ₹16,791. Profit: ${fmt(sgb.pnl)}. Zero tax if held till 2032. Best thing in your portfolio.`,
      tag: "Hold", pnl: sgb.pnl,
    },
    {
      icon: "↑", tone: "green",
      title: `Bitcoin up ${btc.pct}%`,
      sub: `Small position doing well. Keep it under 5% of portfolio. Don't add more right now.`,
      tag: "Hold", pnl: btc.pnl,
    },
    {
      icon: "✓", tone: "green",
      title: "SBI FD — safe 7.25%",
      sub: "Only guaranteed return. Matures soon — renew it or move into NIFTYBEES on next dip.",
      tag: "Renew", pnl: fdPnl,
    },
  ];

  const projs = [
    { label: "If nothing changes", value: total * 0.68, tone: "red",   desc: "Markets fall, QUANT_TECH bleeds more" },
    { label: "Stay the course",    value: total * 1.12, tone: "amber", desc: "Hold all, resume SIP" },
    { label: "Fix it now",         value: total * 1.50, tone: "green", desc: "Exit QUANT_TECH + SIP into NIFTYBEES" },
  ];

  const Row = ({ r }) => (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 10px", borderRadius:8, border:"0.5px solid #f1f5f9", borderLeft:`2px solid ${border[r.tone]}`, marginBottom:5, background:"#fff" }}>
      <div style={{ width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, background:bg[r.tone], color:clr[r.tone] }}>{r.icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", fontSize:12, fontWeight:600, color:"#1e293b" }}>
          {r.title}
          <span style={{ fontSize:10, fontWeight:600, padding:"1px 7px", borderRadius:99, background:bg[r.tone], color:clr[r.tone] }}>{r.tag}</span>
        </div>
        <div style={{ fontSize:11, color:"#64748b", lineHeight:1.5, marginTop:2 }}>{r.sub}</div>
      </div>
      <div style={{ fontSize:12, fontWeight:600, flexShrink:0, color:clr[r.tone], paddingTop:1 }}>
        {r.pnl >= 0 ? "+" : ""}{fmt(r.pnl)}
      </div>
    </div>
  );

  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", padding:"14px 14px 12px" }}>
      <style>{`
        .fp-lbl { font-size:10px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:#94a3b8; margin-bottom:7px; }
        .fp-div { height:1px; background:#f1f5f9; margin:10px 0; }
      `}</style>

      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>What happens next?</span>
        <span style={{ fontSize:10, color:"#94a3b8" }}>Thought for 8 seconds...</span>
      </div>

      <p className="fp-lbl">What's hurting you</p>
      {hurting.map((r) => <Row key={r.title} r={r} />)}

      <div className="fp-div" />

      <p className="fp-lbl">What's working — don't sell</p>
      {working.map((r) => <Row key={r.title} r={r} />)}


      <div style={{ marginTop:8, padding:"9px 11px", borderRadius:8, background:"#f8fafc", border:"0.5px solid #e2e8f0", fontSize:11, color:"#64748b", lineHeight:1.6 }}>
        <strong style={{ color:"#1e293b" }}>Quick win: </strong>
        Sell QUANT_TECH now (book loss for tax savings), move that money + ₹10k/mo SIP into NIFTYBEES. One move, ~₹1.3L extra over 3 years.
      </div>
    </div>
  );
};

export default FutureProjections;