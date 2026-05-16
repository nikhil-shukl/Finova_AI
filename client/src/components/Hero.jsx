import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignInButton, useUser } from "@clerk/react";
import { ArrowRight, FileUp, ShieldCheck, TrendingUp } from "lucide-react";
import Features from "./Features";

const Hero = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  return (
    <>
      <section className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-slate-50">
        <img
          src="/hero.png"
          alt="FinovaAI finance dashboard visual"
          className="absolute inset-y-8 right-0 hidden h-[88%] w-[58%] object-contain opacity-95 lg:block"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_46%,rgba(255,255,255,0.86)_66%,rgba(255,255,255,0.35)_100%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-6 py-16 sm:py-20 lg:min-h-[calc(100vh-76px)]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              <TrendingUp size={14} />
              AI finance intelligence
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              FinovaAI
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Import real portfolio PDFs, replace dummy holdings instantly, and read
              allocation, P&L, risk, market pulse, and AI guidance from one clean finance workspace.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isSignedIn ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Open Dashboard
                  <ArrowRight size={17} />
                </button>
              ) : (
                <SignInButton mode="modal" redirectUrl="/dashboard">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                    Start With Portfolio
                    <ArrowRight size={17} />
                  </button>
                </SignInButton>
              )}

              <Link
                to="/dashboard/ingest"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
              >
                <FileUp size={17} />
                Upload PDF
              </Link>
            </div>

            <div className="mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ["PDF Sync", "Broker statements to dashboard data"],
                ["Risk Score", "Portfolio health in one glance"],
                ["Market Pulse", "News context for holdings"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm font-bold text-slate-950">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
              <ShieldCheck size={16} className="text-emerald-600" />
              Built for focused financial analysis, not noisy speculation.
            </div>
          </div>
        </div>
      </section>

      <Features />
    </>
  );
};

export default Hero;
