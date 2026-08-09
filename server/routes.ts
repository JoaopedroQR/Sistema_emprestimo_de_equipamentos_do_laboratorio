import { Router } from "express";
import { pool } from "./db.js";

const router = Router();

// --- ALUNOS ---
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

// --- EQUIPAMENTOS --- (Você já fez, mantendo aqui para referência)
router.get("/equipamentos", async (_req, res) => {
  const result = await pool.query("SELECT * FROM EQUIPAMENTO ORDER BY nome ASC");
  res.json(result.rows);
});

router.post("/equipamentos", async (req, res) => {
  const nome = req.body.nome || req.body.name;
  const numero_serie = req.body.numero_serie || req.body.serialNumber;
  const query = "INSERT INTO EQUIPAMENTO (nome, numero_serie, descricao, status, data_aquisicao) VALUES ($1, $2, $3, $4, $5) RETURNING *";
  const result = await pool.query(query, [nome, numero_serie, req.body.description || "", "available", new Date()]);
  res.status(201).json(result.rows[0]);
});

// --- EMPRÉSTIMOS ---
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
  
  // Atualiza status do equipamento para emprestado
  await pool.query("UPDATE EQUIPAMENTO SET status = 'borrowed' WHERE id_equipamento = $1", [id_equipamento]);
  
  res.status(201).json(result.rows[0]);
});

export default router;
