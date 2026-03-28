import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelsPath = join(__dirname, "../models");

const readJSON = (file) =>
  JSON.parse(readFileSync(join(modelsPath, file), "utf-8"));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// GET /api/portfolio/:gmail
export const getPortfolio = (req, res) => {
  try {
    const { gmail } = req.params;
    const users = readJSON("users.json");
    const user = users.find((u) => u.gmail === gmail);
    if (!user) return res.status(404).json({ error: "User not found" });

    const portfolioData = readJSON("portfolio.json");
    const holdings = portfolioData[user.id] || [];

    const enriched = holdings.map((h) => {
      const invested = h.avgBuyPrice * h.units;
      const current = h.currentPrice * h.units;
      const pnl = current - invested;
      const pnlPct = ((pnl / invested) * 100).toFixed(2);
      return { ...h, investedAmount: invested, currentValue: current, pnl, pnlPct: parseFloat(pnlPct) };
    });

    const totalInvested = enriched.reduce((s, h) => s + h.investedAmount, 0);
    const totalCurrent = enriched.reduce((s, h) => s + h.currentValue, 0);
    const totalPnL = totalCurrent - totalInvested;
    const totalPnLPct = ((totalPnL / totalInvested) * 100).toFixed(2);

    res.json({
      user,
      holdings: enriched,
      summary: { totalInvested, totalCurrent, totalPnL, totalPnLPct: parseFloat(totalPnLPct) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/portfolio/:gmail/transactions
export const getTransactions = (req, res) => {
  try {
    const { gmail } = req.params;
    const users = readJSON("users.json");
    const user = users.find((u) => u.gmail === gmail);
    if (!user) return res.status(404).json({ error: "User not found" });

    const txData = readJSON("transactions.json");
    res.json({ transactions: txData[user.id] || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/portfolio/:gmail/suggest  — OpenAI call ONLY here
export const getAISuggestions = async (req, res) => {
  try {
    const { gmail } = req.params;
    const users = readJSON("users.json");
    const user = users.find((u) => u.gmail === gmail);
    if (!user) return res.status(404).json({ error: "User not found" });

    const portfolioData = readJSON("portfolio.json");
    const holdings = portfolioData[user.id] || [];

    const allocationSummary = holdings.map((h) => ({
      name: h.assetName,
      class: h.assetClass,
      sector: h.sector,
      pnlPct: (((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100).toFixed(1),
    }));

    const marketContext = `
Current Market Snapshot (March 28, 2026):
- Nifty 50: 22,819 (down 9.3% in 4 weeks due to US-Iran conflict)
- Sensex: 73,583 (down ~1700 pts on Friday)
- INR/USD: 94.82 (record low)
- Brent Crude: $109/barrel (up 45% in a month)
- Gold MCX: ₹1,67,915/10g (record high)
- Banking sector: down 13.6% in 4 weeks
- Tech funds (SIP): down 35-47% YoY
- Infosys acquired Optimum Healthcare IT (positive long-term)
- Government slashed excise duty on petrol (negative for RIL short-term)
- FDI relaxation: Press Note 2 of 2026 (positive for manufacturing/tech)
`;

    const prompt = `You are a senior SEBI-registered financial advisor in India. Based on the user profile and portfolio below, give 4 specific, actionable investment suggestions suited for current market conditions.

User Profile:
- Risk Appetite: ${user.riskAppetite}
- Investment Horizon: ${user.investmentHorizon} term
- Monthly Surplus: ₹${user.monthlyInvestableSurplus}
- Goals: ${user.financialGoals.join(", ")}
- Experience: ${user.investmentExperience}

Current Portfolio Allocation:
${JSON.stringify(allocationSummary, null, 2)}

${marketContext}

Respond ONLY as a JSON array with this structure (no markdown, no extra text):
[
  {
    "title": "short action title",
    "suggestion": "2-3 sentence specific suggestion",
    "action": "Buy / Hold / Rebalance / SIP",
    "urgency": "High / Medium / Low",
    "expectedReturn": "e.g. 12-15% over 2 years",
    "rationale": "1 line why"
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 900,
      temperature: 0.4,
    });

    const raw = completion.choices[0].message.content.replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(raw);
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/portfolio/:gmail/risk  — pure math, no AI
export const getRiskAnalysis = (req, res) => {
  try {
    const { gmail } = req.params;
    const users = readJSON("users.json");
    const user = users.find((u) => u.gmail === gmail);
    if (!user) return res.status(404).json({ error: "User not found" });

    const portfolioData = readJSON("portfolio.json");
    const holdings = portfolioData[user.id] || [];

    const riskWeights = { Stocks: 0.8, Crypto: 1.0, "Mutual Funds": 0.5, ETFs: 0.55, Gold: 0.2, FDs: 0.05 };

    let weightedRisk = 0;
    let totalValue = 0;
    const scenarios = { bestCase: 0, baseCase: 0, worstCase: 0 };

    holdings.forEach((h) => {
      const val = h.currentPrice * h.units;
      const risk = riskWeights[h.assetClass] || 0.5;
      weightedRisk += risk * val;
      totalValue += val;

      // Scenario: horizon-based multipliers
      const horizonYears = user.investmentHorizon === "Short" ? 2 : user.investmentHorizon === "Medium" ? 5 : 10;
      scenarios.bestCase += val * Math.pow(1 + (0.18 - risk * 0.08), horizonYears);
      scenarios.baseCase += val * Math.pow(1 + (0.10 - risk * 0.04), horizonYears);
      scenarios.worstCase += val * Math.pow(1 - (risk * 0.12), horizonYears);
    });

    const riskScore = totalValue > 0 ? ((weightedRisk / totalValue) * 10).toFixed(1) : 0;

    res.json({
      riskScore: parseFloat(riskScore),
      riskLabel: riskScore >= 7 ? "High Risk" : riskScore >= 4 ? "Moderate Risk" : "Low Risk",
      scenarios: {
        bestCase: Math.round(scenarios.bestCase),
        baseCase: Math.round(scenarios.baseCase),
        worstCase: Math.round(scenarios.worstCase),
      },
      totalCurrentValue: Math.round(totalValue),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};