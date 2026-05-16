import express from "express";
import multer from "multer";
import {
  getPortfolio,
  getTransactions,
  getAISuggestions,
  getRiskAnalysis,
  importPortfolio,
} from "../controllers/portfolioController.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF files are accepted."));
  },
});

router.get("/:gmail", getPortfolio);
router.get("/:gmail/transactions", getTransactions);
router.post("/:gmail/suggest", getAISuggestions);
router.get("/:gmail/risk", getRiskAnalysis);
router.post("/:gmail/import", upload.single("portfolio"), importPortfolio);

export default router;
