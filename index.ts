import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes.js"; 
import dotenv from "dotenv";

dotenv.config( );

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Essencial para receber dados do formulário
  app.use(express.json());
  
  app.get("/api/teste", (req, res) => {
  res.json({ mensagem: "O servidor está funcionando!" });
  });

  // Rotas da API - Devem vir ANTES do static e do get("*")
  app.use("/api", apiRoutes);

  // const staticPath =
  //   process.env.NODE_ENV === "production"
  //     ? path.resolve(__dirname, "public")
  //     : path.resolve(__dirname, "..", "dist", "public");

  const staticPath = path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // app.get("*", (req, res) => {
  //   // Se a requisição for para o analytics quebrado, apenas ignore
  //   if (req.url.includes("VITE_ANALYTICS")) {
  //     return res.status(404).end();
  //   }
  //   res.sendFile(path.join(staticPath, "index.html"));
  // });

  app.get("*", (req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).send("Erro: O site ainda não foi construído. Rode 'corepack pnpm build' no terminal.");
      }
    });
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}` );
  });
}

startServer().catch(console.error);