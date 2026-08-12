import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgres://postgres:admin123@localhost:5432/projeto")

app = FastAPI(title="Sistema de Empréstimo de Equipamentos de Laboratório - API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    url = DATABASE_URL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    conn = psycopg2.connect(url, cursor_factory=RealDictCursor)
    return conn

# --- Pydantic Models ---
class AlunoCreate(BaseModel):
    nome: str
    matricula: str
    email: Optional[str] = None
    telefone: Optional[str] = None

class AlunoUpdate(BaseModel):
    nome: Optional[str] = None
    matricula: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    tem_pendencia: Optional[bool] = None

class EquipamentoCreate(BaseModel):
    nome: str
    numero_serie: str
    descricao: Optional[str] = None
    status: Optional[str] = "available"
    quantidade: Optional[int] = 1

class EquipamentoUpdate(BaseModel):
    nome: Optional[str] = None
    numero_serie: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[str] = None
    quantidade: Optional[int] = None

class EmprestimoCreate(BaseModel):
    id_aluno: int
    id_equipamento: int
    data_devolucao_prevista: str
    quantidade: int = 1
    observacoes: Optional[str] = None

class DevolucaoCreate(BaseModel):
    id_equipamento: int
    id_aluno: int
    quantidade: int

# --- Rotas de Alunos ---
@app.get("/api/alunos")
def listar_alunos():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT a.*, 
            (SELECT COUNT(*) FROM EMPRESTIMO e WHERE e.id_aluno = a.id_aluno AND e.data_devolucao_real IS NULL) as active_loan_count,
            (SELECT COUNT(*) FROM EMPRESTIMO e WHERE e.id_aluno = a.id_aluno AND e.data_devolucao_real IS NULL AND e.data_devolucao_prevista < NOW()) > 0 as tem_atraso
            FROM ALUNO a
            ORDER BY a.nome ASC
        """
        cur.execute(query)
        alunos = cur.fetchall()
        for aluno in alunos:
            aluno["tem_pendencia"] = aluno["tem_pendencia"] or aluno["tem_atraso"]
        return alunos
    finally:
        cur.close()
        conn.close()

@app.post("/api/alunos", status_code=status.HTTP_201_CREATED)
def criar_aluno(aluno: AlunoCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "INSERT INTO ALUNO (nome, matricula, email, telefone, tem_pendencia) VALUES (%s, %s, %s, %s, FALSE) RETURNING *"
        cur.execute(query, (aluno.nome, aluno.matricula, aluno.email, aluno.telefone))
        novo_aluno = cur.fetchone()
        conn.commit()
        return novo_aluno
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/alunos/{id}/historico")
def historico_aluno(id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT 
                e.id_emprestimo as id, 
                eq.nome as equipment, 
                e.data_emprestimo as borrowDate, 
                e.data_devolucao_prevista as dueDate,
                e.data_devolucao_real as returnDate,
                CASE 
                    WHEN e.data_devolucao_real IS NOT NULL THEN 'returned'
                    WHEN e.data_devolucao_prevista < NOW() THEN 'overdue'
                    ELSE 'active'
                END as status
            FROM EMPRESTIMO e
            JOIN EQUIPAMENTO eq ON e.id_equipamento = eq.id_equipamento
            WHERE e.id_aluno = %s
            ORDER BY e.data_emprestimo DESC
        """
        cur.execute(query, (id,))
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.delete("/api/alunos/{id}")
def deletar_aluno(id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Verifica se há empréstimos ativos (não devolvidos)
        cur.execute("SELECT COUNT(*) FROM EMPRESTIMO WHERE id_aluno = %s AND data_devolucao_real IS NULL", (id,))
        if cur.fetchone()["count"] > 0:
            raise HTTPException(status_code=400, detail="Não é possível excluir um aluno com empréstimos ativos.")
        
        # Remove histórico de empréstimos (já devolvidos) para evitar erro de FK
        cur.execute("DELETE FROM EMPRESTIMO WHERE id_aluno = %s", (id,))
        
        # Agora remove o aluno
        cur.execute("DELETE FROM ALUNO WHERE id_aluno = %s", (id,))
        conn.commit()
        return {"message": "Aluno excluído com sucesso"}
    except Exception as e:
        conn.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

# --- Rotas de Equipamentos ---
@app.get("/api/equipamentos")
def listar_equipamentos():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT eq.*, 
            COALESCE((SELECT SUM(quantidade) FROM EMPRESTIMO e WHERE e.id_equipamento = eq.id_equipamento AND e.data_devolucao_real IS NULL), 0) as active_loan_quantity
            FROM EQUIPAMENTO eq
            ORDER BY eq.nome ASC
        """
        cur.execute(query)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.get("/api/equipamentos/{id}/alunos")
def listar_alunos_com_equipamento(id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT DISTINCT a.id_aluno, a.nome, a.email, SUM(e.quantidade) as quantidade_emprestada
            FROM ALUNO a
            JOIN EMPRESTIMO e ON a.id_aluno = e.id_aluno
            WHERE e.id_equipamento = %s AND e.data_devolucao_real IS NULL
            GROUP BY a.id_aluno, a.nome, a.email
        """
        cur.execute(query, (id,))
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.post("/api/equipamentos", status_code=status.HTTP_201_CREATED)
def criar_equipamento(eq: EquipamentoCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "INSERT INTO EQUIPAMENTO (nome, numero_serie, descricao, status, data_aquisicao, quantidade) VALUES (%s, %s, %s, %s, CURRENT_DATE, %s) RETURNING *"
        cur.execute(query, (eq.nome, eq.numero_serie, eq.descricao, eq.status or "available", eq.quantidade or 1))
        novo_eq = cur.fetchone()
        conn.commit()
        return novo_eq
    finally:
        cur.close()
        conn.close()

@app.delete("/api/equipamentos/{id}")
def deletar_equipamento(id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Verifica se há empréstimos ativos
        cur.execute("SELECT COUNT(*) FROM EMPRESTIMO WHERE id_equipamento = %s AND data_devolucao_real IS NULL", (id,))
        if cur.fetchone()["count"] > 0:
            raise HTTPException(status_code=400, detail="Não é possível excluir um equipamento que está emprestado.")
        
        # Remove histórico de empréstimos (já devolvidos)
        cur.execute("DELETE FROM EMPRESTIMO WHERE id_equipamento = %s", (id,))
        
        cur.execute("DELETE FROM EQUIPAMENTO WHERE id_equipamento = %s", (id,))
        conn.commit()
        return {"message": "Equipamento excluído com sucesso"}
    except Exception as e:
        conn.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

# --- Rotas de Empréstimos e Devoluções ---
@app.get("/api/emprestimos")
def listar_emprestimos():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT e.*, a.nome as aluno_nome, eq.nome as equipamento_nome 
            FROM EMPRESTIMO e
            JOIN ALUNO a ON e.id_aluno = a.id_aluno
            JOIN EQUIPAMENTO eq ON e.id_equipamento = eq.id_equipamento
            ORDER BY e.data_emprestimo DESC
        """
        cur.execute(query)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.post("/api/emprestimos")
def criar_emprestimo(emp: EmprestimoCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT tem_pendencia, 
            (SELECT COUNT(*) FROM EMPRESTIMO e WHERE e.id_aluno = %s AND e.data_devolucao_real IS NULL AND e.data_devolucao_prevista < NOW()) as atrasos
            FROM ALUNO WHERE id_aluno = %s
        """, (emp.id_aluno, emp.id_aluno))
        aluno = cur.fetchone()
        if not aluno: raise HTTPException(status_code=404, detail="Aluno não encontrado")
        if aluno["tem_pendencia"] or aluno["atrasos"] > 0:
            raise HTTPException(status_code=400, detail="Empréstimo bloqueado: Aluno possui pendências ou atrasos.")

        cur.execute("SELECT quantidade FROM EQUIPAMENTO WHERE id_equipamento = %s", (emp.id_equipamento,))
        eq = cur.fetchone()
        if not eq or eq["quantidade"] < emp.quantidade:
            raise HTTPException(status_code=400, detail="Estoque insuficiente")

        cur.execute(
            "INSERT INTO EMPRESTIMO (id_aluno, id_equipamento, data_emprestimo, data_devolucao_prevista, quantidade, observacoes) VALUES (%s, %s, NOW(), %s, %s, %s)",
            (emp.id_aluno, emp.id_equipamento, emp.data_devolucao_prevista, emp.quantidade, emp.observacoes)
        )
        
        nova_qtd = eq["quantidade"] - emp.quantidade
        status_eq = "borrowed" if nova_qtd == 0 else "available"
        cur.execute("UPDATE EQUIPAMENTO SET quantidade = %s, status = %s WHERE id_equipamento = %s", (nova_qtd, status_eq, emp.id_equipamento))
        
        conn.commit()
        return {"message": "Sucesso"}
    finally:
        cur.close()
        conn.close()

@app.post("/api/devolucao")
def registrar_devolucao(dev: DevolucaoCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id_emprestimo, quantidade FROM EMPRESTIMO WHERE id_equipamento = %s AND id_aluno = %s AND data_devolucao_real IS NULL ORDER BY data_emprestimo ASC",
            (dev.id_equipamento, dev.id_aluno)
        )
        loans = cur.fetchall()
        total_que_o_aluno_tem = sum(loan["quantidade"] for loan in loans)
        
        if not loans: raise HTTPException(status_code=400, detail="Sem empréstimo ativo")
        if dev.quantidade > total_que_o_aluno_tem: raise HTTPException(status_code=400, detail=f"O aluno só possui {total_que_o_aluno_tem} unidades")

        qtd_restante = dev.quantidade
        for loan in loans:
            if qtd_restante <= 0: break
            if loan["quantidade"] <= qtd_restante:
                cur.execute("UPDATE EMPRESTIMO SET data_devolucao_real = NOW() WHERE id_emprestimo = %s", (loan["id_emprestimo"],))
                qtd_restante -= loan["quantidade"]
            else:
                cur.execute("UPDATE EMPRESTIMO SET quantidade = %s WHERE id_emprestimo = %s", (loan["quantidade"] - qtd_restante, loan["id_emprestimo"]))
                qtd_restante = 0

        cur.execute("SELECT quantidade FROM EQUIPAMENTO WHERE id_equipamento = %s", (dev.id_equipamento,))
        eq = cur.fetchone()
        cur.execute("UPDATE EQUIPAMENTO SET quantidade = %s, status = 'available' WHERE id_equipamento = %s", (eq["quantidade"] + dev.quantidade, dev.id_equipamento))
        
        conn.commit()
        return {"message": "Devolvido"}
    finally:
        cur.close()
        conn.close()

# --- Rotas de Relatórios ---
@app.get("/api/relatorios/atrasados")
def relatorio_atrasados():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT e.id_emprestimo as id, eq.nome as equipment, a.nome as student, e.data_emprestimo as borrowDate, e.data_devolucao_prevista as dueDate,
            EXTRACT(DAY FROM (NOW() - e.data_devolucao_prevista))::int as daysOverdue
            FROM EMPRESTIMO e
            JOIN ALUNO a ON e.id_aluno = a.id_aluno
            JOIN EQUIPAMENTO eq ON e.id_equipamento = eq.id_equipamento
            WHERE e.data_devolucao_real IS NULL AND e.data_devolucao_prevista < NOW()
            ORDER BY daysOverdue DESC
        """
        cur.execute(query)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.get("/api/relatorios/top-equipamentos")
def relatorio_top_equipamentos():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "SELECT eq.nome as name, COUNT(e.id_emprestimo) as count FROM EQUIPAMENTO eq JOIN EMPRESTIMO e ON eq.id_equipamento = e.id_equipamento GROUP BY eq.id_equipamento, eq.nome ORDER BY count DESC, MIN(e.data_emprestimo) ASC LIMIT 5"
        cur.execute(query)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.get("/api/relatorios/top-alunos")
def relatorio_top_alunos():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "SELECT a.nome as name, COUNT(e.id_emprestimo) as count FROM ALUNO a JOIN EMPRESTIMO e ON a.id_aluno = e.id_aluno GROUP BY a.id_aluno, a.nome ORDER BY count DESC, MIN(e.data_emprestimo) ASC LIMIT 5"
        cur.execute(query)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.get("/api/teste")
def teste():
    return {"message": "API FastAPI rodando com sucesso!"}
