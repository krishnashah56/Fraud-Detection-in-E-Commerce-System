import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";

import adminRoutes from "./routes/adminRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

const clientOrigins = process.env.CLIENT_ORIGIN?.split(",") ?? true;
app.use(
  cors({
    origin: clientOrigins,
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "fraud-detection-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/admin", adminRoutes);
app.use("/api", checkoutRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
