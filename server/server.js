import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import truthRoutes from './routes/truthRoutes.js';
import portfolioRoutes from "./routes/portfolioRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";

dotenv.config();

const app = express();

// ✅
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
 
app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));


app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

await connectDB();


app.get("/", (req, res) => {
  res.send("Finance News Dashboard API running");
});

app.use("/api/news", newsRoutes);


app.use('/api/truth', truthRoutes);
app.use("/api/portfolio", portfolioRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});