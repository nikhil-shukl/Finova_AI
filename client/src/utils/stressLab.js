export const STRESS_SCENARIOS = {
  base: {
    id: "base",
    label: "Base Volatility",
    description: "A normal correction across growth assets with stable debt.",
    shocks: {
      Stocks: -8,
      "Mutual Funds": -5,
      ETFs: -6,
      Gold: 2,
      FDs: 0,
      Crypto: -18,
    },
  },
  recession: {
    id: "recession",
    label: "Recession Shock",
    description: "Equity drawdown, liquidity pressure, and flight to safety.",
    shocks: {
      Stocks: -22,
      "Mutual Funds": -14,
      ETFs: -16,
      Gold: 8,
      FDs: 1,
      Crypto: -35,
    },
  },
  inflation: {
    id: "inflation",
    label: "Inflation Spike",
    description: "Commodity hedge improves while rate-sensitive assets compress.",
    shocks: {
      Stocks: -12,
      "Mutual Funds": -8,
      ETFs: -10,
      Gold: 14,
      FDs: 1.5,
      Crypto: -20,
    },
  },
  liquidity: {
    id: "liquidity",
    label: "Liquidity Crunch",
    description: "High-beta assets sell off and safe assets preserve capital.",
    shocks: {
      Stocks: -18,
      "Mutual Funds": -11,
      ETFs: -13,
      Gold: 5,
      FDs: 0.75,
      Crypto: -45,
    },
  },
};

const DEFENSIVE_CLASSES = new Set(["Gold", "FDs"]);

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
};

const holdingValue = (holding) =>
  Number(holding.currentValue ?? holding.currentPrice * holding.units) || 0;

const getShockForHolding = (holding, shocks) => {
  const classShock = shocks[holding.assetClass] ?? 0;
  const sectorShock = shocks[`sector:${holding.sector}`] ?? 0;
  return classShock + sectorShock;
};

export function runStressScenario(holdings = [], scenarioId = "base", customShocks = {}) {
  const scenario = STRESS_SCENARIOS[scenarioId] || STRESS_SCENARIOS.base;
  const shocks = { ...scenario.shocks, ...customShocks };
  const currentValue = holdings.reduce((sum, holding) => sum + holdingValue(holding), 0);

  const stressedHoldings = holdings.map((holding) => {
    const current = holdingValue(holding);
    const shockPct = getShockForHolding(holding, shocks);
    const stressedValue = Math.max(0, current * (1 + shockPct / 100));
    const stressedPrice = holding.units ? stressedValue / holding.units : 0;
    const delta = stressedValue - current;

    return {
      ...holding,
      shockPct: round(shockPct),
      stressedPrice: round(stressedPrice),
      stressedValue: round(stressedValue),
      stressDelta: round(delta),
      stressContributionPct: currentValue ? round((Math.abs(delta) / currentValue) * 100) : 0,
    };
  });

  const stressedValue = stressedHoldings.reduce((sum, holding) => sum + holding.stressedValue, 0);
  const drawdown = currentValue - stressedValue;
  const drawdownPct = currentValue ? (drawdown / currentValue) * 100 : 0;
  const defensiveValue = stressedHoldings
    .filter((holding) => DEFENSIVE_CLASSES.has(holding.assetClass))
    .reduce((sum, holding) => sum + holding.stressedValue, 0);
  const largestLosses = [...stressedHoldings]
    .sort((a, b) => a.stressDelta - b.stressDelta)
    .slice(0, 4);
  const topHolding = [...stressedHoldings].sort((a, b) => b.stressedValue - a.stressedValue)[0];
  const topHoldingWeight = stressedValue && topHolding ? (topHolding.stressedValue / stressedValue) * 100 : 0;

  return {
    scenario,
    shocks,
    currentValue: round(currentValue),
    stressedValue: round(stressedValue),
    drawdown: round(drawdown),
    drawdownPct: round(drawdownPct),
    defensiveRatio: stressedValue ? round((defensiveValue / stressedValue) * 100) : 0,
    topHolding,
    topHoldingWeight: round(topHoldingWeight),
    largestLosses,
    stressedHoldings,
    grade: getStressGrade(drawdownPct, topHoldingWeight),
    actionPlan: buildStressActionPlan(drawdownPct, topHoldingWeight, largestLosses, defensiveValue, stressedValue),
  };
}

export function getStressGrade(drawdownPct, topHoldingWeight) {
  if (drawdownPct >= 25 || topHoldingWeight >= 45) return "Critical";
  if (drawdownPct >= 16 || topHoldingWeight >= 35) return "Elevated";
  if (drawdownPct >= 8 || topHoldingWeight >= 25) return "Watch";
  return "Resilient";
}

export function buildStressActionPlan(drawdownPct, topHoldingWeight, largestLosses, defensiveValue, stressedValue) {
  const actions = [];
  const largestLoss = largestLosses[0];
  const defensiveRatio = stressedValue ? (defensiveValue / stressedValue) * 100 : 0;

  if (drawdownPct >= 16) {
    actions.push("Reduce high-beta exposure or hedge before adding fresh risk.");
  } else {
    actions.push("Keep SIPs disciplined and rebalance only if allocation bands break.");
  }

  if (topHoldingWeight >= 35) {
    actions.push("Lower single-holding concentration below 30-35% of stressed value.");
  }

  if (largestLoss?.stressDelta < 0) {
    actions.push(`Review ${largestLoss.assetName}; it drives the largest stress loss.`);
  }

  if (defensiveRatio < 15) {
    actions.push("Add a defensive sleeve through debt, FD, or gold if it matches the goal horizon.");
  }

  return actions.slice(0, 4);
}
