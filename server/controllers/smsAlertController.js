import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// 5 portfolio alert message templates
const ALERT_MESSAGES = [
  "📉 Portfolio Alert: Your portfolio is down today. Nifty dropped 1.7% — review your holdings on FinTrack.",
  "🔔 FinTrack Alert: Gold in your portfolio hit a new high (₹1,67,915/10g). Consider reviewing your allocation.",
  "⚠️ Risk Alert: High volatility detected in your Tech MF holdings. Log in to FinTrack to check your risk score.",
  "📊 Weekly Digest: Your portfolio's current value has been updated. Open FinTrack to see your P&L summary.",
  "💡 FinTrack Tip: Rupee hit ₹94.82/$. Your equity exposure may be impacted — review your rebalancing plan.",
];

/**
 * Shuffle array using Fisher-Yates and pick the first element.
 */
function pickRandomMessage(messages) {
  const arr = [...messages];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr[0];
}

export const sendSmsAlert = async (req, res) => {
  try {
    const toNumber = process.env.OWNER_PHONE_NUMBER;

    if (!toNumber) {
      return res.status(500).json({ success: false, message: "OWNER_PHONE_NUMBER not set in .env" });
    }

    const message = pickRandomMessage(ALERT_MESSAGES);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toNumber,
    });

    console.log(`SMS sent: SID=${result.sid}`);

    return res.status(200).json({
      success: true,
      message: "SMS alert sent successfully.",
      sid: result.sid,
      preview: message,
    });
  } catch (error) {
    console.error("Twilio SMS error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send SMS alert.",
    });
  }
};