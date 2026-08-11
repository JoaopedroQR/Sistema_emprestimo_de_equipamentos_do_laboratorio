# Sistema_emprestimo_de_equipamentos_do_laboratorio
## - É necessário ter PostgreSQL e Node.js

## Para criar o Banco de Dados no PostgreSQL:
### 1. Inicialmente abra o pgAdmin4 do PostgreSQL
### 2. Crie um banco qualquer com nome de sua escolha clicando com o botão direito em *Databases* que fica em *Servers -> PostgreSQL18 (versão 18) -> Databases*. Após isso, acesse o banco por *Servers -> PostgreSQL18 -> Databases -> nome_do_banco*
### 3. Clique com o botão direito no banco e escolha *Query Tool*, clique na pasta *Open File* e abra o arquivo *banco.sql* que está na pasta do trabalho. Clique no "play" *Execute* e, após isso, o banco vazio irá se transformar exatamente como o nosso.
### 4. Para a conexão ser realizada com sucesso com o server, já fora do pgAdmin4, procure o arquivo *.env* e altere dentro dele o nome de usuário, senha e nome do banco para as mesmas credenciais que você possui no pgAdmin4 do PostgreSQL e salve. Assumindo que a porta que você escolheu para o pgAdmin4 foi *5432*. 
### Obs: Lembre-se de manter o pgAdmin4 aberto o tempo inteiro para a conexão não cair

## Para executar:
### 1. Abra o Prompt de Comando ou PowerShell e acesse a pasta do trabalho via *cd C:\......*
### 2. Digite *corepack pnpm install*
### 3. Digite *corepack pnpm add pg dotenv*
### 4. Digite *corepack pnpm build*
### 5. Digite *corepack pnpm dlx tsx server/index.ts*
### Obs: Lembre-se de manter o Prompt/PowerShell aberto o tempo inteiro para a conexão não cair
### Obs2: A depender de der algum erro por falta de alguma dependência, digitar *corepack pnpm add _____* e colocar as dependências que faltam

## Para acessar o Sistema em si:
### 1. Após realizar as etapas anteriores, basta acessar o site pelo link *http://localhost:3000*

## O site com o sistema abrirá e você poderá fazer o "login". Lá é possível criar os alunos, equipamentos e empréstimos. Com o pgAdmin4 será possível ver o banco de dados e se de fato está recebendo as informações do site e salvando.
