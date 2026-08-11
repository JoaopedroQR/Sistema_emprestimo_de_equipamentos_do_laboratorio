# Back-end FastAPI - Sistema de Empréstimo de Equipamentos de Laboratório

Este diretório contém a nova implementação do back-end utilizando **FastAPI**, substituindo o servidor Node.js/Express original e implementando todas as funções pendentes e rotas avançadas.

## 🚀 Funcionalidades Implementadas

1. **Gerenciamento de Alunos (`/api/alunos`)**:
   - `GET /api/alunos`: Lista todos os alunos cadastrados.
   - `POST /api/alunos`: Cadastra um novo aluno.
   - `GET /api/alunos/{id}`: Obtém detalhes de um aluno específico, incluindo seu histórico completo de empréstimos.
   - `PUT /api/alunos/{id}`: Atualiza os dados cadastrais de um aluno.
   - `DELETE /api/alunos/{id}`: Remove um aluno do sistema.
   - `PATCH /api/alunos/{id}/pendencia`: Alterna ou atualiza o status de pendência do aluno (bloqueando ou liberando novos empréstimos).

2. **Gerenciamento de Equipamentos (`/api/equipamentos`)**:
   - `GET /api/equipamentos`: Lista todos os equipamentos.
   - `POST /api/equipamentos`: Cadastra um novo equipamento.
   - `GET /api/equipamentos/{id}`: Obtém detalhes de um equipamento.
   - `PUT /api/equipamentos/{id}`: Atualiza as informações do equipamento.
   - `DELETE /api/equipamentos/{id}`: Remove um equipamento do inventário.

3. **Gerenciamento de Empréstimos e Devoluções**:
   - `GET /api/emprestimos`: Lista todos os empréstimos realizados (com junção dos nomes de alunos e equipamentos para exibição no Dashboard e telas de relatórios).
   - `POST /api/emprestimos`: Registra um novo empréstimo (com validação de disponibilidade do equipamento e verificação de pendências do aluno).
   - `POST /api/devolucao`: Registra a devolução de um equipamento, atualizando automaticamente seu status para disponível.

4. **Verificações e Validações de Negócio**:
   - Bloqueio automático de empréstimo caso o aluno possua `tem_pendencia = true`.
   - Atualização automática do status do equipamento para `'borrowed'` ao emprestar e `'available'` ao devolver.

## 🛠️ Como Executar

1. Certifique-se de que o banco de dados PostgreSQL está rodando e configurado conforme o arquivo `.env`:
   ```env
   DATABASE_URL=postgres://postgres:admin123@localhost:5432/projeto
   ```

2. Instale as dependências do Python:
   ```bash
   pip install -r requirements.txt
   ```

3. Inicie o servidor FastAPI:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. A documentação interativa da API (Swagger UI) estará disponível em:
   `http://localhost:8000/docs`
