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
// Rota para criar um novo empréstimo
router.post("/emprestimos", async (req, res) => {
  const { id_aluno, id_equipamento, data_devolucao_prevista, observacoes } = req.body;
  try {
    // 1. Cria o empréstimo
    const query = "INSERT INTO EMPRESTIMO (id_aluno, id_equipamento, data_emprestimo, data_devolucao_prevista, observacoes) VALUES ($1, $2, NOW(), $3, $4) RETURNING *";
    await pool.query(query, [id_aluno, id_equipamento, data_devolucao_prevista, observacoes]);
    
    // 2. Muda o status do equipamento para 'borrowed' (emprestado)
    await pool.query("UPDATE EQUIPAMENTO SET status = 'borrowed' WHERE id_equipamento = $1", [id_equipamento]);
    
    res.status(201).json({ message: "Empréstimo registrado!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para registrar a devolução
router.post("/devolucao", async (req, res) => {
  const { id_equipamento } = req.body;
  try {
    // 1. Atualiza a data de devolução real no último empréstimo desse item
    await pool.query("UPDATE EMPRESTIMO SET data_devolucao_real = NOW() WHERE id_equipamento = $1 AND data_devolucao_real IS NULL", [id_equipamento]);
    
    // 2. Volta o status do equipamento para 'available' (disponível)
    await pool.query("UPDATE EQUIPAMENTO SET status = 'available' WHERE id_equipamento = $1", [id_equipamento]);
    
    res.json({ message: "Equipamento devolvido!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
