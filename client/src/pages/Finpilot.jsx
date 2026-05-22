import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Bot,
  BrainCircuit,
  FileText,
  Mic,
  RefreshCw,
  Send,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { API_BASE } from "../config/api";

const quickPrompts = [
  "What is my biggest risk?",
  "Should I rebalance?",
  "Which sector is heavy?",
  "Give me action points",
];

const offlineReply = (message) => {
  const text = message.toLowerCase();
  if (text.includes("risk")) {
    return "Your risk depends on concentration, downside sensitivity, and asset mix. Upload a portfolio PDF to get an exact risk answer.";
  }
  if (text.includes("rebalance")) {
    return "Start with overweight holdings, then reduce concentration gradually. FinPilot can make this specific once your PDF is analyzed.";
  }
  if (text.includes("sector")) {
    return "Sector exposure shows where your portfolio depends too much on one theme. A balanced portfolio avoids one-sector dependency.";
  }
  return "FinPilot is ready, but the AI backend is not reachable right now. The uploaded portfolio workflow will work once the backend service is online.";
};

function UploadPanel({ onUpload, loading }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) onUpload(acceptedFiles[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: loading,
  });

  return (
    <div className="grid min-h-[calc(100vh-3rem)] gap-5 xl:grid-cols-[1fr_430px]">
      <section className="flex flex-col justify-center rounded-[2rem] border border-white/10 bg-[#080808] p-6 shadow-2xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d8bd62]/30 bg-[#d8bd62]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#d8bd62]">
            <Bot size={15} />
            FinPilot AI
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight text-white md:text-6xl">
            Portfolio-aware AI advisor.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/60">
            Upload your broker PDF and ask questions about risk, allocation, sectors, and rebalancing in plain language.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`mt-8 cursor-pointer rounded-[1.5rem] border p-6 transition ${
            isDragActive
              ? "border-[#d8bd62] bg-[#d8bd62]/10"
              : "border-dashed border-white/14 bg-white/[0.04] hover:border-[#d8bd62]/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d8bd62] text-black">
              {loading ? <RefreshCw className="animate-spin" size={28} /> : <UploadCloud size={30} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {loading ? "Analyzing portfolio..." : "Drop portfolio PDF"}
              </h2>
              <p className="mt-1 text-sm text-white/45">Click to browse. PDF only, max 10MB.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["PDF read", FileText],
            ["Risk score", ShieldCheck],
            ["AI chat", BrainCircuit],
          ].map(([label, Icon]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Icon className="text-[#d8bd62]" size={20} />
              <p className="mt-3 text-sm font-bold text-white/72">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-white/10 bg-[#080808] p-5 shadow-2xl">
        <div className="rounded-[1.5rem] border border-[#d8bd62]/20 bg-black p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d8bd62]">Agent preview</p>
              <h2 className="mt-2 text-2xl font-black text-white">Ask FinPilot</h2>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              Online
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/72">
              What is the riskiest position in my portfolio?
            </div>
            <div className="rounded-2xl border border-[#d8bd62]/20 bg-[#d8bd62]/10 p-4 text-sm leading-6 text-white/75">
              Upload your statement and I will rank holdings by concentration, volatility, and downside risk.
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Workflow</p>
            <div className="mt-4 space-y-3">
              {["Upload PDF", "Read holdings", "Ask AI"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 text-sm font-semibold text-white/68">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8bd62] text-xs font-black text-black">
                    {index + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function PortfolioSummary({ portfolio, onReset }) {
  const holdings = portfolio?.holdings || [];
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#080808] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d8bd62]">Portfolio loaded</p>
          <h2 className="mt-2 text-2xl font-black text-white">{holdings.length} holdings</h2>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-white/62 hover:border-[#d8bd62]/40 hover:text-[#d8bd62]"
        >
          <RefreshCw size={14} />
          New
        </button>
      </div>

      <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/62">
        {portfolio.summary || "FinPilot created a portfolio context from the uploaded PDF."}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
          <p className="text-xs text-white/35">Risk</p>
          <p className="mt-2 text-xl font-black text-[#d8bd62]">{portfolio.riskScore ?? "-"}/10</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
          <p className="text-xs text-white/35">Level</p>
          <p className="mt-2 text-xl font-black text-white">{portfolio.riskLevel || "Moderate"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
          <p className="text-xs text-white/35">Currency</p>
          <p className="mt-2 text-xl font-black text-white">{portfolio.currency || "INR"}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Top holdings</p>
        <div className="mt-3 space-y-3">
          {holdings.slice(0, 7).map((holding, index) => (
            <div key={`${holding.symbol || holding.name}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">{holding.symbol || holding.ticker || "ASSET"}</p>
                  <p className="truncate text-xs text-white/42">{holding.name || holding.assetName || "Holding"}</p>
                </div>
                <span className="text-sm font-black text-[#d8bd62]">{holding.allocation ?? holding.weight ?? 0}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChatPanel({ sessionId, portfolio }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Portfolio loaded. Ask me about ${portfolio.riskLevel?.toLowerCase() || "moderate"} risk, concentration, or rebalancing.`,
      id: 1,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (value) => {
    const text = value.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { role: "user", text, id: Date.now() }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/finpilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.success ? data.response : offlineReply(text), id: Date.now() + 1 },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: offlineReply(text), id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Voice input works best in Chrome.", id: Date.now() }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => sendMessage(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <section className="flex min-h-[680px] flex-col rounded-[2rem] border border-white/10 bg-[#080808]">
      <header className="flex items-center justify-between border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d8bd62] text-black">
            <Bot size={22} />
          </span>
          <div>
            <h2 className="text-lg font-black text-white">FinPilot Chat</h2>
            <p className="text-xs font-semibold text-emerald-300">Portfolio context ready</p>
          </div>
        </div>
        <button
          onClick={listening ? () => recognitionRef.current?.stop() : startVoice}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
            listening ? "bg-[#d8bd62] text-black" : "border border-white/10 text-white/62"
          }`}
        >
          <Mic size={15} />
          {listening ? "Listening" : "Speak"}
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "rounded-br-md bg-[#d8bd62] font-semibold text-black"
                  : "rounded-bl-md border border-white/10 bg-white/[0.04] text-white/72"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/45">
            FinPilot is thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-5">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/54 hover:border-[#d8bd62]/50 hover:text-[#d8bd62]"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black p-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage(input);
              }
            }}
            rows={1}
            placeholder="Ask about your portfolio..."
            className="min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8bd62] text-black disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function FinPilot() {
  const [portfolio, setPortfolio] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (file) => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("portfolio", file);
      const response = await fetch(`${API_BASE}/finpilot/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Upload failed.");
      setPortfolio(data.portfolio);
      setSessionId(data.sessionId);
    } catch (err) {
      setError(err.message || "Server unreachable. Please check backend deployment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-3rem)]">
      {!portfolio ? (
        <div className="relative">
          <UploadPanel onUpload={handleUpload} loading={loading} />
          {error && (
            <div className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-red-300/30 bg-red-950/90 px-5 py-3 text-sm font-bold text-red-100 shadow-2xl">
              {error}
              <button onClick={() => setError("")} className="text-red-100/70 hover:text-white">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <PortfolioSummary
            portfolio={portfolio}
            onReset={() => {
              setPortfolio(null);
              setSessionId(null);
              setError("");
            }}
          />
          <ChatPanel sessionId={sessionId} portfolio={portfolio} />
        </div>
      )}
    </main>
  );
}
