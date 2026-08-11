import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgres://postgres:admin123@localhost:5432/projeto")

app = FastAPI(title="Sistema de Empréstimo de Equipamentos de Laboratório - API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    # Convert postgres:// to postgresql:// if necessary for psycopg2
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
    observacoes: Optional[str] = None

class DevolucaoCreate(BaseModel):
    id_equipamento: int

# --- Rotas de Alunos ---
@app.get("/api/alunos")
def listar_alunos():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM ALUNO ORDER BY nome ASC")
        alunos = cur.fetchall()
        return alunos
    finally:
        cur.close()
        conn.close()

@app.post("/api/alunos", status_code=status.HTTP_201_CREATED)
def criar_aluno(aluno: AlunoCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            INSERT INTO ALUNO (nome, matricula, email, telefone, tem_pendencia)
            VALUES (%s, %s, %s, %s, FALSE)
            RETURNING *
        """
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

@app.get("/api/alunos/{id}")
def obter_aluno(id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM ALUNO WHERE id_aluno = %s", (id,))
        aluno = cur.fetchone()
        if not aluno:
            raise HTTPException(status_code=404, detail="Aluno não encontrado")
        
        # Buscar histórico de empréstimos do aluno
        hist_query = """
            SELECT e.*, eq.nome as equipamento_nome, eq.numero_serie
            FROM EMPRESTIMO e
            JOIN EQUIPAMENTO eq ON e.id_equipamento = eq.id_equipamento
            WHERE e.id_aluno = %s
            ORDER BY e.data_emprestimo DESC
        """
        cur.execute(hist_query, (id,))
        emprestimos = cur.fetchall()
        aluno["emprestimos"] = emprestimos
        return aluno
    finally:
        cur.close()
        conn.close()

@app.put("/api/alunos/{id}")
def atualizar_aluno(id: int, aluno: AlunoUpdate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM ALUNO WHERE id_aluno = %s", (id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Aluno não encontrado")
        
        fields = []
        values = []
        if aluno.nome is not None:
            fields.append("nome = %s")
            values.append(aluno.nome)
        if aluno.matricula is not None:
            fields.append("matricula = %s")
            values.append(aluno.matricula)
        if aluno.email is not None:
            fields.append("email = %s")
            values.append(aluno.email)
        if aluno.telefone is not None:
            fields.append("telefone = %s")
            values.append(aluno.telefone)
        if aluno.tem_pendencia is not None:
            fields.append("tem_pendencia = %s")
            values.append(aluno.tem_pendencia)
        
        if not fields:
            raise HTTPException(status_code=400, detail="Nenhum campo fornecido para atualização")
        
        values.append(id)
        query = f"UPDATE ALUNO SET {', '.join(fields)} WHERE id_aluno = %s RETURNING *"
        cur.execute(query, values)
        updated = cur.fetchone()
        conn.commit()
        return updated
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/api/alunos/{id}")
def deletar_aluno(id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM ALUNO WHERE id_aluno = %s", (id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Aluno não encontrado")
        
        cur.execute("DELETE FROM ALUNO WHERE id_aluno = %s", (id,))
        conn.commit()
        return {"message": "Aluno removido com sucesso"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.patch("/api/alunos/{id}/pendencia")
def alternar_pendencia(id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT tem_pendencia FROM ALUNO WHERE id_aluno = %s", (id,))
        res = cur.fetchone()
        if not res:
            raise HTTPException(status_code=404, detail="Aluno não encontrado")
        
        nova_pendencia = not res["tem_pendencia"]
        cur.execute("UPDATE ALUNO SET tem_pendencia = %s WHERE id_aluno = %s RETURNING *", (nova_pendencia, id))
        updated = cur.fetchone()
        conn.commit()
        return updated
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()


# --- Rotas de Equipamentos ---
@app.get("/api/equipamentos")
def listar_equipamentos():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM EQUIPAMENTO ORDER BY nome ASC")
        equipamentos = cur.fetchall()
        return equipamentos
    finally:
        cur.close()
        conn.close()

@app.post("/api/equipamentos", status_code=status.HTTP_201_CREATED)
def criar_equipamento(eq: EquipamentoCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            INSERT INTO EQUIPAMENTO (nome, numero_serie, descricao, status, data_aquisicao, quantidade)
            VALUES (%s, %s, %s, %s, CURRENT_DATE, %s)
            RETURNING *
        """
        cur.execute(query, (eq.nome, eq.numero_serie, eq.descricao, eq.status or "available", eq.quantidade or 1))
        novo_eq = cur.fetchone()
        conn.commit()
        return novo_eq
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/equipamentos/{id}")
def obter_equipamento(id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM EQUIPAMENTO WHERE id_equipamento = %s", (id,))
        eq = cur.fetchone()
        if not eq:
            raise HTTPException(status_code=404, detail="Equipamento não encontrado")
        return eq
    finally:
        cur.close()
        conn.close()

@app.put("/api/equipamentos/{id}")
def atualizar_equipamento(id: int, eq: EquipamentoUpdate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM EQUIPAMENTO WHERE id_equipamento = %s", (id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Equipamento não encontrado")
        
        fields = []
        values = []
        if eq.nome is not None:
            fields.append("nome = %s")
            values.append(eq.nome)
        if eq.numero_serie is not None:
            fields.append("numero_serie = %s")
            values.append(eq.numero_serie)
        if eq.descricao is not None:
            fields.append("descricao = %s")
            values.append(eq.descricao)
        if eq.status is not None:
            fields.append("status = %s")
            values.append(eq.status)
        if eq.quantidade is not None:
            fields.append("quantidade = %s")
            values.append(eq.quantidade)
        
        if not fields:
            raise HTTPException(status_code=400, detail="Nenhum campo fornecido para atualização")
        
        values.append(id)
        query = f"UPDATE EQUIPAMENTO SET {', '.join(fields)} WHERE id_equipamento = %s RETURNING *"
        cur.execute(query, values)
        updated = cur.fetchone()
        conn.commit()
        return updated
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/api/equipamentos/{id}")
def deletar_equipamento(id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM EQUIPAMENTO WHERE id_equipamento = %s", (id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Equipamento não encontrado")
        
        cur.execute("DELETE FROM EQUIPAMENTO WHERE id_equipamento = %s", (id,))
        conn.commit()
        return {"message": "Equipamento removido com sucesso"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
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
            SELECT 
                e.id_emprestimo,
                e.id_aluno,
                e.id_equipamento,
                e.data_emprestimo,
                e.data_devolucao_prevista,
                e.data_devolucao_real,
                e.observacoes,
                a.nome as aluno_nome,
                eq.nome as equipamento_nome
            FROM EMPRESTIMO e
            JOIN ALUNO a ON e.id_aluno = a.id_aluno
            JOIN EQUIPAMENTO eq ON e.id_equipamento = eq.id_equipamento
            ORDER BY e.data_emprestimo DESC
        """
        cur.execute(query)
        emprestimos = cur.fetchall()
        return emprestimos
    finally:
        cur.close()
        conn.close()

@app.post("/api/emprestimos", status_code=status.HTTP_201_CREATED)
def criar_emprestimo(emp: EmprestimoCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Verificar se o aluno tem pendência
        cur.execute("SELECT tem_pendencia FROM ALUNO WHERE id_aluno = %s", (emp.id_aluno,))
        aluno = cur.fetchone()
        if not aluno:
            raise HTTPException(status_code=404, detail="Aluno não encontrado")
        if aluno["tem_pendencia"]:
            raise HTTPException(status_code=400, detail="Aluno possui pendências ativas e não pode realizar novos empréstimos")

        # Verificar se o equipamento está disponível
        cur.execute("SELECT status FROM EQUIPAMENTO WHERE id_equipamento = %s", (emp.id_equipamento,))
        eq = cur.fetchone()
        if not eq:
            raise HTTPException(status_code=404, detail="Equipamento não encontrado")
        if eq["status"] != "available":
            raise HTTPException(status_code=400, detail="Equipamento não está disponível para empréstimo")

        # 1. Cria o empréstimo
        query_emp = """
            INSERT INTO EMPRESTIMO (id_aluno, id_equipamento, data_emprestimo, data_devolucao_prevista, observacoes)
            VALUES (%s, %s, NOW(), %s, %s)
            RETURNING *
        """
        cur.execute(query_emp, (emp.id_aluno, emp.id_equipamento, emp.data_devolucao_prevista, emp.observacoes))
        novo_emp = cur.fetchone()

        # 2. Muda o status do equipamento para 'borrowed'
        cur.execute("UPDATE EQUIPAMENTO SET status = 'borrowed' WHERE id_equipamento = %s", (emp.id_equipamento,))

        conn.commit()
        return novo_emp
    except HTTPException as he:
        conn.rollback()
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/devolucao")
def registrar_devolucao(dev: DevolucaoCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # 1. Atualiza a data de devolução real no último empréstimo pendente desse item
        cur.execute(
            "UPDATE EMPRESTIMO SET data_devolucao_real = NOW() WHERE id_equipamento = %s AND data_devolucao_real IS NULL RETURNING *",
            (dev.id_equipamento,)
        )
        emp = cur.fetchone()
        if not emp:
            raise HTTPException(status_code=404, detail="Nenhum empréstimo ativo encontrado para este equipamento")

        # 2. Volta o status do equipamento para 'available'
        cur.execute("UPDATE EQUIPAMENTO SET status = 'available' WHERE id_equipamento = %s", (dev.id_equipamento,))

        conn.commit()
        return {"message": "Equipamento devolvido com sucesso!", "emprestimo": emp}
    except HTTPException as he:
        conn.rollback()
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

# --- Endpoint de Teste ---
@app.get("/api/teste")
def teste():
    return {"message": "API FastAPI rodando com sucesso!"}
