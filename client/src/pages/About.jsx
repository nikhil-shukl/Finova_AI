import React from "react";
import { Link } from "react-router-dom";
import { Brain, DatabaseZap, LineChart, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TeamSection from "../components/TeamSection";

const strengths = [
  { icon: Brain, label: "AI product thinking", text: "Portfolio workflows shaped around clarity, risk, and practical investor decisions." },
  { icon: DatabaseZap, label: "Full stack systems", text: "React dashboards, API services, PDF extraction, structured data, and automation-ready backends." },
  { icon: LineChart, label: "Finance UX", text: "Light, scan-friendly interfaces for holdings, market signals, allocation, and P&L." },
  { icon: ShieldCheck, label: "Trust first", text: "Secure-by-default architecture with private user data, clear boundaries, and transparent outputs." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-24">
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">About Us</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                FinovaAI is built for practical portfolio intelligence.
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-600">
                The product turns broker PDFs, market context, and portfolio data into
                a clean dashboard with risk, P&L, stress testing, and AI insight.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                >
                  View Dashboard
                </Link>
                <Link
                  to="/dashboard/ingest"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-600"
                >
                  Import Portfolio PDF
                </Link>
              </div>
            </div>
          </div>
        </section>

        <TeamSection compact />

        <section className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={21} />
                  </div>
                  <h2 className="mt-4 text-base font-bold text-slate-950">{item.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
