import React from "react";
import { Link } from "react-router-dom";
import { Code2, ExternalLink, Mail, ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="FinovaAI" className="h-9 w-auto" />
              <div>
                <p className="text-lg font-bold text-slate-950">FinovaAI</p>
                <p className="text-sm font-medium text-blue-600">Finance Growth With AI</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              A light, secure finance intelligence workspace for portfolio tracking,
              PDF-based holdings sync, market pulse, and AI-assisted decision support.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">Product</p>
            <div className="mt-4 grid gap-2 text-sm text-slate-500">
              <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
              <Link to="/dashboard/news" className="hover:text-blue-600">Market Pulse</Link>
              <Link to="/dashboard/ingest" className="hover:text-blue-600">PDF Portfolio Sync</Link>
              <Link to="/about" className="hover:text-blue-600">About Us</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">Built By</p>
            <p className="mt-4 text-sm font-semibold text-slate-700">Nikhil Shukla</p>
            <p className="mt-1 text-sm text-slate-500">AI Full Stack Developer</p>
            <div className="mt-4 flex items-center gap-2">
              <a className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200" href="https://github.com/nikhil-shukl" target="_blank" rel="noreferrer" aria-label="GitHub">
                <Code2 size={16} />
              </a>
              <a className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200" href="mailto:nikhilshukla@gmail.com" aria-label="Email">
                <Mail size={16} />
              </a>
              <span className="p-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600" aria-label="Secure finance platform">
                <ShieldCheck size={16} />
              </span>
              <a className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200" href="https://www.linkedin.com/in/nikhil-shukla-962b41317/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 FinovaAI. All rights reserved.</p>
          <p>Educational insights only. Final investment decisions rest with the investor.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
