import React from "react";
import { featuresData } from "../assets/features";
import {
  Brain,
  FileText,
  LineChart,
  ShieldCheck,
} from "lucide-react";

const iconMap = {
  FileText,
  LineChart,
  ShieldCheck,
  Brain,
};

const Features = () => {
  return (
    <section id="features" className="bg-slate-50 py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-bold text-blue-600">Core modules</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
              A clean fintech product stack.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Less clutter, more signal: upload, analyze, stress-test, and act from one dashboard.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
