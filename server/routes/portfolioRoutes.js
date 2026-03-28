import express from "express";
import {
  getPortfolio,
  getTransactions,
  getAISuggestions,
  getRiskAnalysis,
} from "../controllers/portfolioController.js";

const router = express.Router();

router.get("/:gmail", getPortfolio);
router.get("/:gmail/transactions", getTransactions);
router.post("/:gmail/suggest", getAISuggestions);
router.get("/:gmail/risk", getRiskAnalysis);

export default router;