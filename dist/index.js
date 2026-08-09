// server/index.ts
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

// server/routes.ts
import { Router } from "express";

// server/db.ts
import pkg from "pg";
import dotenv from "dotenv";
var { Pool } = pkg;
dotenv.config();
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
pool.on("error", (err) => {
  console.error("Erro inesperado no cliente do banco de dados:", err);
});

// server/routes.ts
var router = Router();
router.get("/alunos", async (_req, res) => {
  const result = await pool.query("SELECT * FROM ALUNO ORDER BY nome ASC");
  res.json(result.rows);
});
router.post("/alunos", async (req, res) => {
  const { nome, name, matricula, email, telefone } = req.body;
  const query = "INSERT INTO ALUNO (nome, matricula, email, telefone) VALUES ($1, $2, $3, $4) RETURNING *";
  const result = await pool.query(query, [nome || name, matricula, email, telefone]);
  res.status(201).json(result.rows[0]);
});
router.get("/equipamentos", async (_req, res) => {
  const result = await pool.query("SELECT * FROM EQUIPAMENTO ORDER BY nome ASC");
  res.json(result.rows);
});
router.post("/equipamentos", async (req, res) => {
  const nome = req.body.nome || req.body.name;
  const numero_serie = req.body.numero_serie || req.body.serialNumber;
  const query = "INSERT INTO EQUIPAMENTO (nome, numero_serie, descricao, status, data_aquisicao) VALUES ($1, $2, $3, $4, $5) RETURNING *";
  const result = await pool.query(query, [nome, numero_serie, req.body.description || "", "available", /* @__PURE__ */ new Date()]);
  res.status(201).json(result.rows[0]);
});
router.get("/emprestimos", async (_req, res) => {
  const query = `
    SELECT e.*, a.nome as aluno_nome, eq.nome as equipamento_nome 
    FROM EMPRESTIMO e
    JOIN ALUNO a ON e.id_aluno = a.id_aluno
    JOIN EQUIPAMENTO eq ON e.id_equipamento = eq.id_equipamento
    ORDER BY e.data_emprestimo DESC
  `;
  const result = await pool.query(query);
  res.json(result.rows);
});
router.post("/emprestimos", async (req, res) => {
  const { id_aluno, id_equipamento, data_devolucao_prevista, observacoes } = req.body;
  const query = "INSERT INTO EMPRESTIMO (id_aluno, id_equipamento, data_emprestimo, data_devolucao_prevista, observacoes) VALUES ($1, $2, NOW(), $3, $4) RETURNING *";
  const result = await pool.query(query, [id_aluno, id_equipamento, data_devolucao_prevista, observacoes]);
  await pool.query("UPDATE EQUIPAMENTO SET status = 'borrowed' WHERE id_equipamento = $1", [id_equipamento]);
  res.status(201).json(result.rows[0]);
});
var routes_default = router;

// server/index.ts
import dotenv2 from "dotenv";
dotenv2.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json());
  app.get("/api/teste", (req, res) => {
    res.json({ mensagem: "O servidor est\xE1 funcionando!" });
  });
  app.use("/api", routes_default);
  const staticPath = path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).send("Erro: O site ainda n\xE3o foi constru\xEDdo. Rode 'corepack pnpm build' no terminal.");
      }
    });
  });
  const port = process.env.PORT || 3e3;
  server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}
startServer().catch(console.error);
