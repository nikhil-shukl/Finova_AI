import React from "react";
import { featuresData } from "../assets/features";
import {
  Brain,
  FileText,
  LineChart,
  Newspaper,
  ShieldCheck,
  Users,
} from "lucide-react";

const iconMap = {
  Newspaper,
  FileText,
  LineChart,
  Users,
  ShieldCheck,
  Brain,
};

const Features = () => {
  return (
    <section id="features" className="border-y border-slate-200 bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-sm font-bold text-blue-600">Platform modules</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
              Everything a fintech recruiter expects to see in one product.
            </h2>
          </div>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            FinovaAI brings together data ingestion, portfolio analytics, market
            intelligence, secure identity, and AI decision support in a clean full
            stack architecture.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature) => {
            const Icon = iconMap[feature.iconName];

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {Icon && <Icon className="h-6 w-6" />}
                </div>

                <h3 className="mt-5 text-lg font-black text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
