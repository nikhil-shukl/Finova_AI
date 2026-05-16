import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignInButton, useUser } from "@clerk/react";
import { ArrowRight, FileUp, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import Features from "./Features";
import TeamSection from "./TeamSection";

const metrics = [
  { label: "Portfolio Value", value: "Rs. 3.51L", trend: "+12.43%" },
  { label: "Risk Score", value: "5.7/10", trend: "Moderate" },
  { label: "Stress Grade", value: "Watch", trend: "Scenario ready" },
];

const workflow = [
  "PDF upload",
  "Holdings sync",
  "Risk signals",
];

const Hero = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-px bg-slate-200" />
        <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              <TrendingUp size={14} />
              Fintech portfolio AI
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.02] text-slate-950 sm:text-6xl">
              Portfolio clarity in seconds.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Upload a broker PDF and get holdings, P&L, risk score, stress tests,
              and AI insight in one clean finance dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isSignedIn ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Open Intelligence Dashboard
                  <ArrowRight size={17} />
                </button>
              ) : (
                <SignInButton mode="modal" redirectUrl="/dashboard">
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                    Launch FinovaAI
                    <ArrowRight size={17} />
                  </button>
                </SignInButton>
              )}

              <Link
                to="/dashboard/ingest"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
              >
                <FileUp size={17} />
                Import Portfolio PDF
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                Secure auth
              </span>
              <span>PDF sync</span>
              <span>AI risk insight</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 shadow-xl shadow-slate-200/70">
              <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400">FINOVA DASHBOARD</p>
                    <p className="mt-1 text-lg font-black text-slate-950">Live portfolio view</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <Sparkles size={13} />
                    Synced
                  </span>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-3">
                  {metrics.map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold text-slate-400">{item.label}</p>
                      <p className="mt-3 text-xl font-black text-slate-950">{item.value}</p>
                      <p className="mt-1 text-xs font-bold text-emerald-600">{item.trend}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 p-4 pt-0 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-sm font-bold text-slate-800">Allocation signal</p>
                    <div className="mt-5 flex h-40 items-end gap-2">
                      {[44, 62, 31, 77, 48, 88, 55].map((height, index) => (
                        <div key={height} className="flex flex-1 items-end rounded-full bg-slate-100">
                          <div
                            className={`w-full rounded-full ${index % 3 === 0 ? "bg-blue-600" : index % 3 === 1 ? "bg-cyan-500" : "bg-emerald-500"}`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-sm font-bold text-slate-800">Workflow</p>
                    <div className="mt-4 space-y-3">
                      {workflow.map((item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TeamSection />
      <Features />
    </>
  );
};

export default Hero;
