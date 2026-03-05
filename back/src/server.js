import app from "./app.js";
import { env } from "./config/env.js";
import { seedDefaultFunds } from "./services/bootstrap.service.js";

const startServer = async () => {
  await seedDefaultFunds();

  app.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
