import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const ASSET_CLASS_ALIASES = {
  stock: "Stocks",
  stocks: "Stocks",
  equity: "Stocks",
  equities: "Stocks",
  share: "Stocks",
  shares: "Stocks",
  mf: "Mutual Funds",
  mutualfund: "Mutual Funds",
  mutualfunds: "Mutual Funds",
  fund: "Mutual Funds",
  funds: "Mutual Funds",
  etf: "ETFs",
  etfs: "ETFs",
  gold: "Gold",
  sgb: "Gold",
  fd: "FDs",
  fds: "FDs",
  crypto: "Crypto",
};

const KNOWN_ASSETS = [
  { keys: ["INFY", "INFOSYS"], assetName: "Infosys Ltd", ticker: "INFY", sector: "IT", assetClass: "Stocks" },
  { keys: ["HDFCBANK", "HDFC BANK"], assetName: "HDFC Bank Ltd", ticker: "HDFCBANK", sector: "Banking", assetClass: "Stocks" },
  { keys: ["RELIANCE", "RELIANCE INDUSTRIES"], assetName: "Reliance Industries", ticker: "RELIANCE", sector: "Energy", assetClass: "Stocks" },
  { keys: ["TCS", "TATA CONSULTANCY"], assetName: "Tata Consultancy Services", ticker: "TCS", sector: "IT", assetClass: "Stocks" },
  { keys: ["WIPRO"], assetName: "Wipro Ltd", ticker: "WIPRO", sector: "IT", assetClass: "Stocks" },
  { keys: ["ICICIBANK", "ICICI BANK"], assetName: "ICICI Bank Ltd", ticker: "ICICIBANK", sector: "Banking", assetClass: "Stocks" },
  { keys: ["SBIN", "STATE BANK"], assetName: "State Bank of India", ticker: "SBIN", sector: "Banking", assetClass: "Stocks" },
  { keys: ["ASIANPAINT", "ASIAN PAINTS"], assetName: "Asian Paints Ltd", ticker: "ASIANPAINT", sector: "FMCG", assetClass: "Stocks" },
  { keys: ["NIFTYBEES", "NIFTY BEES"], assetName: "Nifty BeES", ticker: "NIFTYBEES", sector: "Index", assetClass: "ETFs" },
  { keys: ["SGB", "SOVEREIGN GOLD"], assetName: "Sovereign Gold Bond", ticker: "SGB", sector: "Commodity", assetClass: "Gold" },
  { keys: ["BTC", "BITCOIN"], assetName: "Bitcoin", ticker: "BTC", sector: "Crypto", assetClass: "Crypto" },
];

const cleanKey = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeAssetClass = (value = "Stocks") =>
  ASSET_CLASS_ALIASES[cleanKey(value)] || value || "Stocks";

const inferSector = (holding) => {
  if (holding.sector || holding.industry || holding.category) {
    return holding.sector || holding.industry || holding.category;
  }

  const text = `${holding.assetName || holding.name || ""} ${holding.ticker || holding.symbol || ""}`.toLowerCase();
  if (text.includes("bank")) return "Banking";
  if (text.includes("tech") || text.includes("infosys") || text.includes("tcs") || text.includes("wipro")) return "IT";
  if (text.includes("gold") || text.includes("sgb")) return "Commodity";
  if (text.includes("nifty") || text.includes("index")) return "Index";
  if (text.includes("bitcoin") || text.includes("btc")) return "Crypto";
  if (text.includes("debt") || text.includes("bond") || text.includes("fd")) return "Debt";
  return "Diversified";
};

export const normalizeImportedHoldings = (holdings = []) =>
  holdings
    .map((holding, index) => {
      const assetName =
        holding.assetName ||
        holding.name ||
        holding.securityName ||
        holding.schemeName ||
        holding.symbol ||
        `Holding ${index + 1}`;
      const ticker = holding.ticker || holding.symbol || holding.isin || assetName.split(" ").slice(0, 2).join("_");
      const units = toNumber(holding.units ?? holding.quantity ?? holding.qty ?? holding.shares ?? holding.allottedUnits, 1);
      const avgBuyPrice = toNumber(
        holding.avgBuyPrice ?? holding.averagePrice ?? holding.avgPrice ?? holding.buyPrice ?? holding.costPrice ?? holding.price,
        0,
      );
      const currentPrice = toNumber(
        holding.currentPrice ?? holding.marketPrice ?? holding.ltp ?? holding.nav ?? holding.lastPrice,
        avgBuyPrice || 1,
      );

      return {
        id: holding.id || `imported_${index + 1}`,
        assetClass: normalizeAssetClass(holding.assetClass || holding.class || holding.type || "Stocks"),
        assetName,
        ticker: String(ticker).toUpperCase(),
        units,
        avgBuyPrice: Number((avgBuyPrice || currentPrice).toFixed(2)),
        currentPrice: Number((currentPrice || avgBuyPrice).toFixed(2)),
        dateOfPurchase: holding.dateOfPurchase || holding.purchaseDate || holding.date || new Date().toISOString().slice(0, 10),
        sector: inferSector(holding),
        exchange: holding.exchange || holding.market || "NSE",
      };
    })
    .filter((holding) => holding.units > 0 && holding.avgBuyPrice > 0 && holding.currentPrice > 0);

async function parseWithAI(rawText) {
  if (!openai) return [];

  const prompt = `Extract every portfolio holding from this PDF text.
Return ONLY valid JSON with this exact shape:
{
  "holdings": [
    {
      "assetClass": "Stocks | Mutual Funds | ETFs | Gold | FDs | Crypto",
      "assetName": "full holding name",
      "ticker": "symbol or short code",
      "units": 10,
      "avgBuyPrice": 100.25,
      "currentPrice": 110.50,
      "sector": "IT",
      "exchange": "NSE",
      "dateOfPurchase": "YYYY-MM-DD"
    }
  ]
}
Rules:
- Extract actual holdings only.
- Use statement market price, NAV, LTP, closing price or current value per unit for currentPrice.
- If currentPrice is missing, use avgBuyPrice.
- If avgBuyPrice is missing but invested value and quantity exist, calculate avgBuyPrice.
- If units are missing but value and price exist, calculate units.
- Do not add holdings that are not in the document.

PDF TEXT:
${rawText.slice(0, 10000)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 1800,
  });

  const content = response.choices[0].message.content.trim().replace(/```json|```/g, "");
  const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || content);
  return normalizeImportedHoldings(parsed.holdings || []);
}

function parseHeuristically(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const holdings = [];

  for (const line of lines) {
    const upper = line.toUpperCase();
    const known = KNOWN_ASSETS.find((asset) => asset.keys.some((key) => upper.includes(key)));
    if (!known) continue;

    const numbers = line
      .match(/(?:\d{1,3}(?:,\d{2,3})+|\d+)(?:\.\d+)?/g)
      ?.map((value) => toNumber(value))
      .filter((value) => value > 0) || [];

    if (!numbers.length) continue;

    const units = numbers.find((value) => value <= 100000) || 1;
    const priceCandidates = numbers.filter((value) => value !== units && value > 1);
    const avgBuyPrice = priceCandidates[0] || numbers[0];
    const currentPrice = priceCandidates[1] || avgBuyPrice;

    holdings.push({
      ...known,
      units,
      avgBuyPrice,
      currentPrice,
      exchange: known.assetClass === "Mutual Funds" ? "MF" : "NSE",
    });
  }

  return normalizeImportedHoldings(holdings);
}

export async function parsePortfolioHoldings(rawText) {
  try {
    const aiHoldings = await parseWithAI(rawText);
    if (aiHoldings.length) return aiHoldings;
  } catch (error) {
    console.warn("[portfolioImportService] AI parsing fallback:", error.message);
  }

  return parseHeuristically(rawText);
}
