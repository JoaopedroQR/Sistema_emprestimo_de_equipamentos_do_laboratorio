import { Router } from "express";
import { pool } from "./db.js";

const router = Router();

// --- ALUNOS ---
router.get("/alunos", async (_req, res) => {
  const result = await pool.query("SELECT * FROM ALUNO ORDER BY nome ASC");
  res.json(result.rows);
});

router.post("/alunos", async (req, res) => {
  const { nome, matricula, email, telefone } = req.body;
  const query = "INSERT INTO ALUNO (nome, matricula, email, telefone) VALUES ($1, $2, $3, $4) RETURNING *";
  const result = await pool.query(query, [nome, matricula, email, telefone]);
  res.status(201).json(result.rows[0]);
});

// --- EQUIPAMENTOS ---
router.get("/equipamentos", async (_req, res) => {
  const result = await pool.query("SELECT * FROM EQUIPAMENTO ORDER BY nome ASC");
  res.json(result.rows);
});

router.post("/equipamentos", async (req, res) => {
  const { nome, numero_serie, descricao, status, data_aquisicao } = req.body;
  const query = "INSERT INTO EQUIPAMENTO (nome, numero_serie, descricao, status, data_aquisicao) VALUES ($1, $2, $3, $4, $5) RETURNING *";
  const result = await pool.query(query, [nome, numero_serie, descricao, status, data_aquisicao]);
  res.status(201).json(result.rows[0]);
});

// --- EMPRÉSTIMOS ---
router.get("/emprestimos", async (_req, res) => {
  const query = `
    SELECT e.*, a.nome as aluno_nome, eq.nome as equipamento_nome 
    FROM EMPRESTIMO e
    JOIN ALUNO a ON e.id_aluno = a.id_aluno
    JOIN EQUIPAMENTO eq ON e.id_equipamento = eq.id_equipamento
  `;
  const result = await pool.query(query);
  res.json(result.rows);
});

router.post("/emprestimos", async (req, res) => {
  const { id_aluno, id_equipamento, data_devolucao_prevista, observacoes } = req.body;
  const query = "INSERT INTO EMPRESTIMO (id_aluno, id_equipamento, data_emprestimo, data_devolucao_prevista, observacoes) VALUES ($1, $2, NOW(), $3, $4) RETURNING *";
  const result = await pool.query(query, [id_aluno, id_equipamento, data_devolucao_prevista, observacoes]);
  res.status(201).json(result.rows[0]);
});

export default router;
