import React, { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { STRESS_SCENARIOS, runStressScenario } from "../utils/stressLab";

const fmt = (value = 0) =>
  value >= 1e7
    ? `Rs.${(value / 1e7).toFixed(2)}Cr`
    : value >= 1e5
    ? `Rs.${(value / 1e5).toFixed(2)}L`
    : `Rs.${Math.round(value).toLocaleString("en-IN")}`;

const gradeClass = {
  Resilient: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Watch: "bg-blue-50 text-blue-700 border-blue-200",
  Elevated: "bg-amber-50 text-amber-700 border-amber-200",
  Critical: "bg-red-50 text-red-700 border-red-200",
};

const PortfolioStressLab = ({ holdings = [] }) => {
  const [scenarioId, setScenarioId] = useState("recession");
  const result = useMemo(
    () => runStressScenario(holdings, scenarioId),
    [holdings, scenarioId],
  );

  if (!holdings.length) return null;

  const scenarioList = Object.values(STRESS_SCENARIOS);
  const lossRows = result.largestLosses.filter((holding) => holding.stressDelta < 0);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Portfolio Stress Lab</h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Scenario engine for downside risk, concentration, and action planning.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {scenarioList.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setScenarioId(scenario.id)}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                scenarioId === scenario.id
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600"
              }`}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">{result.scenario.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{result.scenario.description}</p>
          </div>
          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${gradeClass[result.grade]}`}>
            {result.grade}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Current Value", value: fmt(result.currentValue), icon: BarChart3, color: "text-slate-700" },
          { label: "Stressed Value", value: fmt(result.stressedValue), icon: AlertTriangle, color: "text-amber-600" },
          { label: "Drawdown", value: `${result.drawdownPct.toFixed(2)}%`, icon: AlertTriangle, color: "text-red-500" },
          { label: "Defensive Sleeve", value: `${result.defensiveRatio.toFixed(1)}%`, icon: ShieldCheck, color: "text-emerald-600" },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{metric.label}</p>
                <Icon size={16} className={metric.color} />
              </div>
              <p className={`mt-3 text-xl font-black ${metric.color}`}>{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Largest stress contributors
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {lossRows.length ? (
              lossRows.map((holding) => (
                <div key={holding.id} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">{holding.assetName}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {holding.assetClass} · shock {holding.shockPct}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-red-500">{fmt(holding.stressDelta)}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {holding.stressContributionPct.toFixed(1)}% impact
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-slate-500">No negative stress contributors in this scenario.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Risk desk action plan</p>
          <div className="mt-4 space-y-3">
            {result.actionPlan.map((action) => (
              <div key={action} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                <p className="text-sm leading-6 text-slate-600">{action}</p>
              </div>
            ))}
          </div>
          {result.topHolding && (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-bold text-blue-700">Post-stress concentration</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {result.topHolding.assetName}: {result.topHoldingWeight.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PortfolioStressLab;
