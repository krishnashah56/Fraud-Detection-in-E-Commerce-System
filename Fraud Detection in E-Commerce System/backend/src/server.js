import dotenv from "dotenv";

import app from "./app.js";
import connectDatabase from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  await connectDatabase(process.env.MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`Backend API listening on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
