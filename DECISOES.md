## 1. Decisões assumidas
 ### 1. O pedido não especifica os modelos de login(administrador e usuário). Assumimos que apenas ADM's do laboratório teriam acesso a esse sistema. Se o cliente esperasse que o aluno também acesse o sistema, precisariamos implementar uma nova rota de acesso do aluno, tirando algumas permissões que apenas os ADM's possuem.
 ### 2. O pedido não especifica como ocorre o registro de ADM's. ADM's são cadastrados direto pelo banco de dados. Se o cliente quiser cadastrar pelo aplicativo, teriamos que criar uma aba de cadastro para criar as credenciais do ADM.
 ### 3. Não é especificado quais abas o aplicativo deve conter. Foi assumido que teriamos aba de equipamento, alunos, relatório e um dashboard geral. Se o cliente quiser alguma outra aba é preciso implementar no código, sendo necessário mais tempo para a finalização do app.
 ### 4. Não especifica quais dados cada equipamento e aluno devem ter no banco. Criamos o banco com os equipamentos contendo [nome, numero de série, quantidade, status] e o aluno contendo [nome completo, matricula, email, telefone pessoal]. Se o cliente quiser adicionar mais algum atributo nessas entidades, será necessário modificar o banco de dados, pondo em risco as relações já existentes e a estrutura agora utilizada.
 ### 5. Não foi especificado como deveriamos fazer o dashboard. Colocamos na aba o Total de Equipamentos, equipamentos Disponíveis, total emprestado, quais estão em manutenção e quais os empréstimos mais recentes. Se o cliente desejar modificar algo, é necessário adicionar mais parâmetros e criar novos campos.
 ### 6. O cliente não indicou como funciona as devoluções. Assumimos que, quando o aluno devolvesse o equipamente, o ADM registra no proprio app essa devolução, evitando devoluções falsas. Se o cliente desejar que o próprio aluno registre sua devolução, nós precisariamos fazer a rota de aluno e criar essa funnção no código.



## 2. Perguntas ao cliente

 ### 1. A quantidade representa um estoque agrupado ou cada unidade deve ser controlada individualmente por um ID/ número de série?
    Controle Individual: cada computador, microscópio ou outro equipamento deve possuir um ID próprio, como “SN-LNV-2024-001”. Nesse caso, cada empréstimo e devolução deve estar vinculado a uma unidade específica, e o sistema deve impedir que o mesmo ID seja emprestado para duas pessoas ao mesmo tempo.

 ### 2. Quais situações criam uma pendência e impedem um novo empréstimo?
    qualquer irregularidade: além de atrasos, também criam pendência equipamentos danificados, perdidos, não devolvidos ou empréstimos sem conferência do técnico. Nesse caso, somente um administrador autorizado pode resolver a pendência.

 ### 3. O sistema será usado em apenas um computador ou por vários computadores conectados à rede do laboratório?
    apenas um computador: os dados podem ser armazenados localmente, desde que exista uma rotina de backup e restauração para evitar perda de informações.

## 3. Critérios de aceite
 ### 1. Na tela de login, preencher um email qualquer e uma senha não vazia, clicar em “Entrar” → o sistema deve abrir /dashboard e registrar userRole=admin no armazenamento local do navegador.
 ### 2. Na tela “Equipamentos”, abrir “Emprestar” em qualquer equipamento, selecionar “João Silva” → o campo de email deve aparecer preenchido e desabilitado com joao.silva@academy.com; selecionar uma data de devolução e clicar em “Confirmar Empréstimo” → o modal deve fechar e deve aparecer uma notificação de empréstimo registrado.
 ### 3. Na tela “Equipamentos”, abrir “Registrar Devolução” de um equipamento emprestado e clicar em “Confirmar Devolução” sem selecionar um ID → deve aparecer a mensagem “Selecione o ID do equipamento” e o modal deve permanecer aberto; selecionar um ID da lista, informar quantidade 1 e confirmar → o modal deve fechar e deve aparecer uma notificação de devolução registrada.


## 4. Decisões da ferramenta de IA
 ### Dados estáticos no próprio front-end
    O código também decidiu armazenar equipamentos, alunos, IDs e empréstimos em listas fixas ou estados locais do React. Essa escolha é plausível para demonstrar rapidamente a navegação e os modais sem backend. Para o laboratório, entretanto, é inadequada como solução final: os dados podem desaparecer ao recarregar a página, não são compartilhados entre computadores da rede e não garantem rastreabilidade.
 ### Estados de equipamento definidos em três categorias
    A implementação escolheu três status: available — disponível, borrowed — emprestado e maintenance — em manutenção. Essa estrutura é simples e cobre o fluxo básico apresentado. Pode ser insuficiente se o laboratório precisar distinguir, por exemplo, equipamento perdido, danificado, reservado, aguardando conferência ou baixado do inventário. A lista final de status deveria ser confirmada com a coordenação antes da implementação do banco de dados.



## 5. Declaração de uso de IA
    Foi utilizado nesse trabalho apenas a manus AI.

## Horas escrevendo ou gerando código: JP: 2 horas
## Horas decidindo o que o sistema deveria fazer: JP: 3 horas 