import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bot,
  BrainCircuit,
  FileUp,
  LockKeyhole,
  MessageSquare,
  Mic,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Volume2,
  X,
} from "lucide-react";
import { API_BASE } from "../config/api";

const agentTabs = ["Search", "Analyze", "Manage", "Research"];
const quickPrompts = [
  "What's my biggest risk?",
  "Should I rebalance?",
  "Top performing sector?",
  "Any red flags?",
];

const demoRows = [
  { label: "Portfolio score", value: "78", sub: "Good", tone: "text-emerald-300" },
  { label: "Drawdown guard", value: "-8.4%", sub: "Stress view", tone: "text-amber-300" },
  { label: "AI confidence", value: "92%", sub: "Ready", tone: "text-sky-300" },
];

const riskTheme = {
  Conservative: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Moderate: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Aggressive: "border-red-400/30 bg-red-400/10 text-red-200",
};

const speakText = (text) => {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};

const fallbackAdvisorReply = (message) => {
  const query = message.toLowerCase();
  if (query.includes("risk")) {
    return "Your risk view combines allocation, volatility sensitivity, sector concentration, and downside stress. Upload a broker PDF to make this answer portfolio-specific.";
  }
  if (query.includes("rebalance")) {
    return "Start with the largest overweight sector, review losing positions, then shift gradually toward your target allocation. I can make this specific once a portfolio PDF is analyzed.";
  }
  if (query.includes("sector")) {
    return "Sector concentration is usually the first risk signal to check. A healthy portfolio should avoid depending on one theme unless that is an intentional bet.";
  }
  return "FinPilot is ready, but the AI backend is not reachable right now. You can still upload and review portfolio structure once the service is online.";
};

function MetricPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
        <Icon size={15} className="text-[#d8bd62]" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function AgentPreview() {
  return (
    <div className="relative rounded-[2rem] border border-white/10 bg-[#080808] p-4 shadow-2xl shadow-black/60">
      <div className="rounded-[1.5rem] border border-[#d8bd62]/20 bg-[#0d0d0b] p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d8bd62]">FinPilot Agent</p>
            <h2 className="mt-2 text-2xl font-black text-white">Portfolio command center</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Online
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {demoRows.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/45">{item.label}</p>
              <p className={`mt-2 text-2xl font-black ${item.tone}`}>{item.value}</p>
              <p className="text-xs font-semibold text-white/40">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {agentTabs.map((tab, index) => (
            <span
              key={tab}
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
                index === 2
                  ? "border-[#d8bd62] bg-[#d8bd62]/10 text-[#d8bd62]"
                  : "border-white/10 text-white/55"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-4 py-3">
            <MessageSquare size={18} className="text-[#d8bd62]" />
            <span className="flex-1 text-sm font-semibold text-white/85">What is the weakest part of my portfolio?</span>
            <span className="rounded-lg bg-[#d8bd62] p-2 text-black">
              <Send size={16} />
            </span>
          </div>

          <div className="mt-3 min-h-48 rounded-xl border border-[#d8bd62]/15 bg-[linear-gradient(145deg,rgba(216,189,98,0.12),rgba(34,197,94,0.05),rgba(255,255,255,0.02))] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-black">
                <Bot size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Agent response</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
                  I found concentration risk, downside beta, and a rebalancing path. Upload the PDF to make the signal exact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadZone({ onUpload, isLoading }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) onUpload(acceptedFiles[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <section className="min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d8bd62]/30 bg-[#d8bd62]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#d8bd62]">
            <Sparkles size={15} />
            AI wealth intelligence
          </div>

          <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight text-white md:text-7xl">
            Ask your portfolio before you act.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
            Upload a broker PDF and let FinPilot read holdings, score risk, surface weak spots, and answer like a portfolio-aware AI agent.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MetricPill icon={FileUp} label="Input" value="PDF" />
            <MetricPill icon={ShieldCheck} label="Risk" value="Live" />
            <MetricPill icon={BrainCircuit} label="Agent" value="LLM" />
          </div>

          <motion.div
            {...getRootProps()}
            whileHover={{ y: -2 }}
            className={`mt-8 cursor-pointer rounded-[1.75rem] border p-5 transition ${
              isDragActive
                ? "border-[#d8bd62] bg-[#d8bd62]/10"
                : "border-white/10 bg-white/[0.04] hover:border-[#d8bd62]/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d8bd62] text-black shadow-lg shadow-[#d8bd62]/20">
                {isLoading ? <RefreshCw className="animate-spin" size={27} /> : <UploadCloud size={28} />}
              </div>
              <div className="flex-1">
                <p className="text-xl font-black text-white">
                  {isLoading ? "Reading portfolio..." : isDragActive ? "Drop the PDF here" : "Drop portfolio PDF"}
                </p>
                <p className="mt-1 text-sm text-white/45">PDF only, max 10MB. Click here to browse.</p>
              </div>
              <ArrowUpRight className="hidden text-[#d8bd62] sm:block" size={24} />
            </div>
          </motion.div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-white/50">
            <span className="inline-flex items-center gap-2"><LockKeyhole size={15} /> Private workspace</span>
            <span className="inline-flex items-center gap-2"><BarChart3 size={15} /> Stress insights</span>
            <span className="inline-flex items-center gap-2"><Mic size={15} /> Voice Q&A</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.08 }}>
          <AgentPreview />
        </motion.div>
      </div>
    </section>
  );
}

function PortfolioPanel({ portfolio }) {
  const riskClass = riskTheme[portfolio.riskLevel] || riskTheme.Moderate;
  const holdings = portfolio.holdings || [];

  return (
    <aside className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d8bd62]">Analyzed portfolio</p>
          <h2 className="mt-2 text-2xl font-black text-white">{holdings.length || 0} holdings</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${riskClass}`}>
          {portfolio.riskLevel || "Moderate"} risk
        </span>
      </div>

      <p className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/65">
        {portfolio.summary || "FinPilot generated a portfolio snapshot from your uploaded statement."}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
          <p className="text-xs text-white/40">Risk score</p>
          <p className="mt-2 text-xl font-black text-[#d8bd62]">{portfolio.riskScore ?? "-"}/10</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
          <p className="text-xs text-white/40">Diversified</p>
          <p className="mt-2 text-xl font-black text-emerald-300">{portfolio.diversificationScore ?? "-"}/10</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
          <p className="text-xs text-white/40">Currency</p>
          <p className="mt-2 text-xl font-black text-white">{portfolio.currency || "INR"}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">Top holdings</p>
        <div className="mt-3 space-y-3">
          {holdings.slice(0, 8).map((holding, index) => (
            <div key={`${holding.symbol || holding.name}-${index}`} className="rounded-2xl border border-white/10 bg-black/35 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">{holding.symbol || holding.ticker || "ASSET"}</p>
                  <p className="truncate text-xs text-white/45">{holding.name || holding.assetName || "Holding"}</p>
                </div>
                <span className="text-sm font-black text-[#d8bd62]">{holding.allocation ?? holding.weight ?? 0}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#d8bd62]"
                  style={{ width: `${Math.min(Number(holding.allocation || holding.weight || 0), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {!!portfolio.topSectors?.length && (
        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">Sectors</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {portfolio.topSectors.map((sector) => (
              <span key={sector} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/65">
                {sector}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function VoiceStrip({ listening, speaking, transcript, onStop, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border-b border-[#d8bd62]/20 bg-[#d8bd62]/10 px-5 py-3"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8bd62] text-black">
            <Mic size={18} />
          </span>
          <div>
            <p className="text-sm font-black text-white">{listening ? "Listening..." : speaking ? "Speaking..." : "Voice mode"}</p>
            <p className="max-w-xl truncate text-xs text-white/50">{transcript || "Ask FinPilot about risk, allocation, or rebalance ideas."}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(listening || speaking) && (
            <button onClick={onStop} className="rounded-full border border-red-300/30 px-3 py-1 text-xs font-bold text-red-200">
              Stop
            </button>
          )}
          <button onClick={onClose} className="rounded-full border border-white/10 p-2 text-white/60">
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ChatPanel({ sessionId, portfolio }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `I've analyzed your ${portfolio.riskLevel?.toLowerCase() || "moderate"} portfolio. Ask me about risk, concentration, or rebalancing.`,
      id: 1,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceOpenRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const setVoice = (value) => {
    voiceOpenRef.current = value;
    setVoiceOpen(value);
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMessage = { role: "user", text: trimmed, id: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTranscript("");
    setTyping(true);

    try {
      const response = await fetch(`${API_BASE}/finpilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: trimmed }),
      });
      const data = await response.json();
      const reply = data.success ? data.response : fallbackAdvisorReply(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", text: reply, id: Date.now() + 1 }]);
      if (voiceOpenRef.current) {
        setSpeaking(true);
        speakText(reply);
        setTimeout(() => setSpeaking(false), Math.min(5000, reply.length * 38));
      }
    } catch {
      const reply = fallbackAdvisorReply(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", text: reply, id: Date.now() + 1 }]);
    } finally {
      setTyping(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Voice input is best supported in Chrome.", id: Date.now() }]);
      return;
    }

    stopSpeaking();
    setVoice(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map((result) => result[0].transcript).join("");
      setTranscript(text);
      if (event.results[event.results.length - 1].isFinal) sendMessage(text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const closeVoice = () => {
    recognitionRef.current?.stop();
    stopSpeaking();
    setListening(false);
    setTranscript("");
    setVoice(false);
  };

  return (
    <section className="flex min-h-[680px] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#080808]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d8bd62] text-black">
            <Bot size={22} />
          </span>
          <div>
            <h2 className="text-lg font-black text-white">FinPilot Agent</h2>
            <p className="text-xs font-semibold text-emerald-300">Online - portfolio context loaded</p>
          </div>
        </div>
        <button
          onClick={voiceOpen ? closeVoice : startListening}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${
            voiceOpen ? "bg-[#d8bd62] text-black" : "border border-white/10 text-white/70"
          }`}
        >
          <Mic size={16} />
          {voiceOpen ? "Voice on" : "Speak"}
        </button>
      </div>

      <AnimatePresence>
        {voiceOpen && (
          <VoiceStrip
            listening={listening}
            speaking={speaking}
            transcript={transcript}
            onStop={() => {
              recognitionRef.current?.stop();
              stopSpeaking();
              setListening(false);
            }}
            onClose={closeVoice}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 space-y-4 overflow-y-auto bg-[#050505] p-5">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "rounded-br-md bg-[#d8bd62] font-semibold text-black"
                  : "rounded-bl-md border border-white/10 bg-white/[0.04] text-white/75"
              }`}
            >
              {message.text}
            </div>
          </motion.div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/55">
              FinPilot is thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 bg-[#0b0b09] p-4">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/55 hover:border-[#d8bd62]/50 hover:text-[#d8bd62]"
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
            placeholder="Ask about allocation, risk, sectors..."
            className="min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
            disabled={typing}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8bd62] text-black disabled:opacity-40"
          >
            <Send size={17} />
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
      setError(err.message || "Server unreachable. Please check the backend deployment.");
    } finally {
      setLoading(false);
    }
  };

  if (!portfolio) {
    return (
      <div className="relative">
        <UploadZone onUpload={handleUpload} isLoading={loading} />
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-red-300/30 bg-red-950/90 px-5 py-3 text-sm font-bold text-red-100 shadow-2xl"
            >
              {error}
              <button onClick={() => setError("")} className="rounded-full p-1 text-red-100/70 hover:text-white">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#030303] px-5 py-6 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d8bd62] text-black">
              <BrainCircuit size={28} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d8bd62]">FinPilot AI</p>
              <h1 className="mt-1 text-2xl font-black text-white">Agent dashboard</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">
              <Activity size={14} />
              Live analysis
            </span>
            <button
              onClick={() => {
                setPortfolio(null);
                setSessionId(null);
                setError("");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-black text-white/70 hover:border-[#d8bd62]/50 hover:text-[#d8bd62]"
            >
              <RefreshCw size={15} />
              New portfolio
            </button>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <PortfolioPanel portfolio={portfolio} />
          <ChatPanel sessionId={sessionId} portfolio={portfolio} />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { icon: TrendingUp, label: "Market-aware reasoning", text: "Agent replies are grounded in uploaded holdings and portfolio risk." },
            { icon: ShieldCheck, label: "Risk-first workflow", text: "Every answer starts from concentration, downside, and allocation quality." },
            { icon: Volume2, label: "Voice interaction", text: "Speak to FinPilot for fast portfolio questions during review." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                <Icon className="text-[#d8bd62]" size={22} />
                <h3 className="mt-4 text-base font-black text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
