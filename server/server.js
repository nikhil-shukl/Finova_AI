import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";


dotenv.config();

const app = express();

// ✅ ONLY THIS CHANGED
app.use(cors({
  origin: "http://localhost:5000",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

await connectDB();

app.get("/", (req, res) => {
  res.send("Server is running!");
});


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () =>
    console.log("Server is running on PORT: " + PORT)
  );
}

export default app;