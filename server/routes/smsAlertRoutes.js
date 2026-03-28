import express from "express";
import { sendSmsAlert } from "../controllers/smsAlertController.js";

const router = express.Router();

// POST /api/sms/alert  →  picks a random message & sends via Twilio
router.post("/alert", sendSmsAlert);

export default router;