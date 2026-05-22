export const USER_GMAIL = "nikhilshukla@gmail.com";

export const DEFAULT_USER = {
  id: "user_001",
  fullName: "Nikhil Shukla",
  gmail: USER_GMAIL,
  phone: "",
  riskAppetite: "Moderate",
  investmentExperience: "Intermediate",
  monthlyIncome: 95000,
  monthlyInvestableSurplus: 22000,
  financialGoals: ["Wealth Creation", "Retirement", "Emergency Fund"],
  investmentHorizon: "Medium",
  createdAt: "2024-06-01",
};

export const DEMO_HOLDINGS = [
  {
    id: "p001",
    assetClass: "Stocks",
    assetName: "Infosys Ltd",
    ticker: "INFY",
    units: 18,
    avgBuyPrice: 1724.5,
    currentPrice: 1581.2,
    sector: "IT",
    exchange: "NSE",
  },
  {
    id: "p002",
    assetClass: "Stocks",
    assetName: "HDFC Bank Ltd",
    ticker: "HDFCBANK",
    units: 12,
    avgBuyPrice: 1642,
    currentPrice: 1489.75,
    sector: "Banking",
    exchange: "NSE",
  },
  {
    id: "p003",
    assetClass: "Stocks",
    assetName: "Reliance Industries",
    ticker: "RELIANCE",
    units: 8,
    avgBuyPrice: 2915,
    currentPrice: 2614.3,
    sector: "Energy",
    exchange: "NSE",
  },
  {
    id: "p004",
    assetClass: "Mutual Funds",
    assetName: "Mirae Asset Large Cap",
    ticker: "MIRAE_LC",
    units: 312.45,
    avgBuyPrice: 112.4,
    currentPrice: 104.8,
    sector: "Diversified",
    exchange: "MF",
  },
  {
    id: "p005",
    assetClass: "Mutual Funds",
    assetName: "Quant Technology Fund",
    ticker: "QUANT_TECH",
    units: 185,
    avgBuyPrice: 98.6,
    currentPrice: 60.2,
    sector: "Technology",
    exchange: "MF",
  },
  {
    id: "p006",
    assetClass: "Gold",
    assetName: "Sovereign Gold Bond 2024",
    ticker: "SGB2024",
    units: 4,
    avgBuyPrice: 6342,
    currentPrice: 16791.5,
    sector: "Commodity",
    exchange: "BSE",
  },
];

export const PORTFOLIO_STORAGE_KEY = "finova-imported-portfolio";
export const PORTFOLIO_IMPORT_META_KEY = "finova-import-meta";

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
  fixeddeposit: "FDs",
  crypto: "Crypto",
  cryptocurrency: "Crypto",
};

const SECTOR_BY_KEYWORD = [
  ["bank", "Banking"],
  ["hdfc", "Banking"],
  ["icici", "Banking"],
  ["axis", "Banking"],
  ["infosys", "IT"],
  ["tcs", "IT"],
  ["wipro", "IT"],
  ["tech", "IT"],
  ["reliance", "Energy"],
  ["ongc", "Energy"],
  ["paint", "FMCG"],
  ["itc", "FMCG"],
  ["nifty", "Index"],
  ["gold", "Commodity"],
  ["sgb", "Commodity"],
  ["bitcoin", "Crypto"],
  ["btc", "Crypto"],
  ["debt", "Debt"],
  ["bond", "Debt"],
  ["fd", "Debt"],
];

const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const cleanKey = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

export function normalizeAssetClass(value = "Stocks") {
  const key = cleanKey(value);
  return ASSET_CLASS_ALIASES[key] || value || "Stocks";
}

export function inferSector(holding) {
  const provided = holding.sector || holding.industry || holding.category;
  if (provided) return provided;

  const text = `${holding.assetName || holding.name || ""} ${holding.ticker || holding.symbol || ""}`.toLowerCase();
  const match = SECTOR_BY_KEYWORD.find(([keyword]) => text.includes(keyword));
  return match?.[1] || "Diversified";
}

export function normalizeHolding(holding, index = 0) {
  const assetName = holding.assetName || holding.name || holding.securityName || holding.schemeName || holding.symbol || `Holding ${index + 1}`;
  const ticker = holding.ticker || holding.symbol || holding.isin || assetName.split(" ").slice(0, 2).join("_").toUpperCase();
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
    avgBuyPrice: roundMoney(avgBuyPrice || currentPrice),
    currentPrice: roundMoney(currentPrice || avgBuyPrice),
    dateOfPurchase: holding.dateOfPurchase || holding.purchaseDate || holding.date || new Date().toISOString().slice(0, 10),
    sector: inferSector(holding),
    exchange: holding.exchange || holding.market || "NSE",
  };
}

export function enrichHoldings(holdings = []) {
  return holdings.map((holding, index) => {
    const normalized = normalizeHolding(holding, index);
    const investedAmount = roundMoney(normalized.avgBuyPrice * normalized.units);
    const currentValue = roundMoney(normalized.currentPrice * normalized.units);
    const pnl = roundMoney(currentValue - investedAmount);
    const pnlPct = investedAmount > 0 ? roundMoney((pnl / investedAmount) * 100) : 0;

    return {
      ...normalized,
      investedAmount,
      currentValue,
      pnl,
      pnlPct,
    };
  });
}

export function buildPortfolioPayload(payload, fallbackUser = DEFAULT_USER) {
  const sourceHoldings = Array.isArray(payload)
    ? payload
    : payload?.holdings || payload?.portfolio?.holdings || [];
  const user = payload?.user || payload?.portfolio?.user || fallbackUser;
  const holdings = enrichHoldings(sourceHoldings).filter((holding) => holding.units > 0);
  const totalInvested = roundMoney(holdings.reduce((sum, holding) => sum + holding.investedAmount, 0));
  const totalCurrent = roundMoney(holdings.reduce((sum, holding) => sum + holding.currentValue, 0));
  const totalPnL = roundMoney(totalCurrent - totalInvested);
  const totalPnLPct = totalInvested > 0 ? roundMoney((totalPnL / totalInvested) * 100) : 0;

  return {
    user: { ...fallbackUser, ...user, fullName: "Nikhil Shukla", gmail: USER_GMAIL },
    holdings,
    summary: { totalInvested, totalCurrent, totalPnL, totalPnLPct },
  };
}

export function buildDemoPortfolio() {
  return buildPortfolioPayload({ user: DEFAULT_USER, holdings: DEMO_HOLDINGS });
}

export function calculatePortfolioRisk(holdings = []) {
  const riskWeights = {
    Stocks: 0.8,
    Crypto: 1,
    "Mutual Funds": 0.5,
    ETFs: 0.55,
    Gold: 0.2,
    FDs: 0.05,
  };
  const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const weightedRisk = holdings.reduce(
    (sum, holding) => sum + (riskWeights[holding.assetClass] || 0.5) * holding.currentValue,
    0,
  );
  const riskScore = totalValue > 0 ? roundMoney((weightedRisk / totalValue) * 10) : 0;

  return {
    riskScore,
    riskLabel: riskScore >= 7 ? "High Risk" : riskScore >= 4 ? "Moderate Risk" : "Low Risk",
    totalCurrentValue: Math.round(totalValue),
  };
}

export function buildImportedTransactions(holdings = []) {
  return holdings.map((holding, index) => ({
    id: `import_tx_${index + 1}`,
    type: "Import",
    ticker: holding.ticker,
    date: holding.dateOfPurchase || new Date().toISOString().slice(0, 10),
    units: holding.units,
    price: holding.avgBuyPrice,
    amount: holding.investedAmount,
  }));
}

export function readImportedPortfolio() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const portfolio = buildPortfolioPayload(parsed);
    return portfolio.holdings.length ? portfolio : null;
  } catch {
    window.localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
    window.localStorage.removeItem(PORTFOLIO_IMPORT_META_KEY);
    return null;
  }
}

export function saveImportedPortfolio(payload, meta = {}) {
  const portfolio = buildPortfolioPayload(payload);
  if (!portfolio.holdings.length) {
    throw new Error("No holdings found in the uploaded portfolio.");
  }

  window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio));
  window.localStorage.setItem(
    PORTFOLIO_IMPORT_META_KEY,
    JSON.stringify({
      importedAt: new Date().toISOString(),
      ...meta,
    }),
  );
  window.dispatchEvent(new Event("finova-portfolio-imported"));
  return portfolio;
}

export function readImportMeta() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PORTFOLIO_IMPORT_META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
