import React from "react";
import { BrainCircuit, Code2, ExternalLink, Sparkles } from "lucide-react";

const team = [
  {
    name: "Nikhil Shukla",
    role: "AI Full Stack Developer",
    focus: "Agentic AI systems, fintech UX, portfolio intelligence",
    image: "/nikhil-shukla.jpeg",
    icon: BrainCircuit,
    link: "https://www.linkedin.com/in/nikhil-shukla-962b41317/",
  },
  {
    name: "Vinit Kaple",
    role: "Full Stack Developer",
    focus: "Frontend, backend APIs, product execution",
    image: "/vinit-kaple.svg",
    icon: Code2,
  },
];

const TeamSection = ({ compact = false }) => {
  return (
    <section id="team" className={`${compact ? "bg-slate-50 py-10" : "bg-white py-14"} border-y border-slate-200`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600">Our Team</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Built by focused full stack developers.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-500">
            A compact team building clean finance dashboards, AI workflows, and production-ready web systems.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {team.map((member) => {
            const Icon = member.icon;

            return (
              <article
                key={member.name}
                className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[170px_1fr] sm:items-center"
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="aspect-square h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-2xl font-black text-slate-950">{member.name}</h3>
                  <p className="mt-1 text-base font-bold text-blue-600">{member.role}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{member.focus}</p>
                  {member.link && (
                    <a
                      href={member.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600"
                    >
                      <ExternalLink size={16} />
                      LinkedIn
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {!compact && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            <Sparkles size={16} />
            Recruiter-ready fintech engineering showcase
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;
