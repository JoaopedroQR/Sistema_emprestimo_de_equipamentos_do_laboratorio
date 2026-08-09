import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes.js"; // Importa as novas rotas

const __filename = fileURLToPath(import.meta.url );
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Habilita o servidor a entender JSON no corpo das requisições
  app.use(express.json());

  // Registra as rotas da API (Passo 3)
  app.use("/api", apiRoutes);

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  // IMPORTANTE: Deve ficar por último
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/` );
    console.log(`API disponível em http://localhost:${port}/api` );
  });
}

startServer().catch(console.error);
