# Sistema_emprestimo_de_equipamentos_do_laboratorio

## Para criar o Banco de Dados no PostgreSQL:
### 1. Inicialmente abra o pgAdmin4 do PostgreSQL
### 2. Crie um banco qualquer com nome de sua escolha.
### 3. Após isso, clique com o botão direito no banco e escolha Query Tool, clique na pasta e abra o arquivo banco.sql que está na pasta do trabalho. Clique em executar após isso que o banco irá ser criado exatamente como o nosso.
### 4. Para a conexão ser realizada com sucesso com o server, procure o arquivo .env e altere dentro dele o nome de usuário, senha e nome do banco que possui em seu pgAdmin4 do PostgreSQL e salve. 
### Obs: Lembre-se de manter o pgAdmin4 aberto o tempo inteiro para a conexão não cair

## Agora para executar:
### 1. Abra o Prompt de Comando ou PowerShell e acesse a pasta do trabalho via cd C:/......
### 2. Digite corepack pnpm install
### 3. Digite corepack pnpm dlx tsx server/index.ts
### Obs: Lembre-se de manter o Prompt/PowerShell aberto o tempo inteiro para a conexão não cair
### Obs2: A depender de der algum erro por falta de alguma dependência, dar corepack pnpm add _____ e colocar as dependências que faltam

## Para acessar o Sistema em si:
### 1. Após realizar as etapas anteriores, acesse o site pelo linl http:/localhost:3000

## O site com o sistema abrirá e você poderá fazer o "login". Lá é possível criar os alunos, equipamentos e empréstimos. Com o pgAdmin4 será possível ver o banco de dados e se de fato está recebendo as informações do site e salvando.
