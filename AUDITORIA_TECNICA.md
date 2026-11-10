# Auditoria técnica do CapVest — revisão de simulados e cronograma

**Data:** 09/11/2026  
**Base:** `CapVest-Final.zip` enviado nesta conversa e revisão de trabalho `CapVest-Entrega-Atualizada.zip`.  
**Escopo desta revisão:** banco de questões, extração de alternativas, simulados aleatórios, respostas dissertativas, cronograma, rotas e consistência visual das áreas internas.

## 1. Diagnóstico do acervo de questões

O índice `backend/data/questions-index.json` foi lido e auditado por script. Resultado atual:

| Indicador | Quantidade |
|---|---:|
| Documentos indexados | 36 |
| Registros de questões/trechos | 1.450 |
| Questões com numeração identificada | 1.265 |
| Objetivas reconhecidas | 594 |
| Objetivas com gabarito associado | 431 |
| Objetivas sem gabarito associado | 163 |
| Dissertativas reconhecidas | 671 |

**Cobertura por vestibular:** todas as 1.265 questões numeradas do índice pertencem à FUVEST. ENEM e UNICAMP não possuem questões indexadas nesta entrega. A biblioteca pode listar documentos dessas instituições, mas isso não significa que o texto das questões esteja importado e pronto para uso.

O parser de alternativas foi ajustado para reconhecer padrões como `(A)`, `A)`, `A.` e equivalentes. Antes, parte das questões de múltipla escolha era classificada indevidamente como aberta por causa do formato `(A)` comum nos PDFs da FUVEST.

## 2. Simulados

Foi criada uma rota de criação de simulados que:

- filtra questões pelo `vestibularId` real do índice;
- permite filtrar por ano e tipo;
- sorteia questões existentes com embaralhamento criptograficamente aleatório;
- não gera enunciados, alternativas ou questões artificiais;
- não mistura questões de vestibulares diferentes;
- bloqueia a criação quando o acervo não possui quantidade suficiente;
- para simulados exclusivamente objetivos, seleciona apenas questões com gabarito identificado;
- salva a sessão, configurações, respostas e resultado no MySQL;
- permite recuperar a sessão e mantém rascunho de respostas no servidor;
- corrige objetivas apenas quando existe gabarito associado; na busca individual, permite registrar a alternativa escolhida mesmo quando o gabarito ainda não está disponível;
- registra respostas dissertativas sem inventar nota.

O frontend ganhou configuração de vestibular, quantidade, tipo, ano e duração, navegação entre questões, cronômetro opcional, indicador de progresso, salvamento automático e resumo da correção.

## 3. Questões dissertativas

As questões abertas agora têm campo de resposta e endpoint autenticado para salvar a resposta na conta do estudante. Em simulados e provas, as respostas são registradas e aparecem como pendentes de revisão.

Há integração opcional para solicitar feedback formativo por IA usando `GEMINI_API_KEY` ou `ANTHROPIC_API_KEY`. O feedback é qualitativo, apresenta pontos fortes e melhorias e informa que não equivale à nota oficial nem substitui o espelho da banca. Sem chave configurada, a plataforma informa que a revisão por IA está indisponível; não atribui nota fictícia.

**Limitação do acervo:** o índice atual não contém espelhos de correção dissertativa estruturados suficientes para correção automática oficial. Portanto, a plataforma pode registrar as respostas e, com IA configurada, fornecer devolutiva formativa; não pode afirmar que está reproduzindo a correção oficial FUVEST.

## 4. Cronograma

O cronograma foi substituído por um fluxo conectado ao backend/MySQL, com:

- objetivo, vestibular, curso e data da prova;
- meta de horas semanais;
- disponibilidade diária em minutos;
- matérias, prioridades, metas semanais por matéria e tópicos;
- geração de atividades para quatro semanas;
- revisão periódica;
- inclusão manual de tarefas;
- marcação de conclusão e exclusão;
- filtros de visualização para 7, 14 e 28 dias.

As tabelas `user_study_plans` e `user_study_tasks` são criadas pelo backend quando ele inicia. A geração respeita a disponibilidade informada e a carga semanal definida, e não apaga atividades já concluídas ao regenerar as pendentes.

## 5. Interface e navegação

- A barra lateral foi ampliada com acesso direto a Simulados, Cronograma, Redações e Desempenho.
- O layout mobile da barra lateral passou a usar navegação horizontal, evitando que o menu fixo cubra o conteúdo.
- Simulados e Cronograma receberam páginas e componentes próprios, com cartões, estados de carregamento/erro, feedback e responsividade.
- Questões, Materiais, páginas por vestibular, Ranking e áreas de trabalho receberam refinamentos de hierarquia, espaçamento, cards e cores para se aproximarem da Home e do Perfil.

## 6. Persistência e novas tabelas

A migração `backend/migrations/003_learning_workflows.sql` documenta as tabelas de sessões de simulado, respostas abertas, planos e tarefas. O serviço `backend/Services/learningSchema.js` cria essas tabelas na inicialização, além das tabelas de gamificação já existentes.

O banco de questões continua sendo o índice JSON produzido pela ingestão dos PDFs; as sessões, respostas dos estudantes e cronogramas ficam no MySQL.

## 7. Verificações executadas nesta revisão

- `node --check` executado em controllers, routers, services, scripts e `backend/server.js`: sem erros de sintaxe nos arquivos verificados.
- 75 arquivos `.js`/`.jsx` de frontend e backend foram analisados pelo parser TypeScript em modo de leitura JSX: zero erros de sintaxe e zero imports relativos ausentes.
- Os 34 arquivos CSS passaram por verificação estrutural simples de chaves balanceadas (não substitui o compilador CSS do Vite).
- `backend/scripts/audit-question-bank.js` executado com sucesso e produziu os quantitativos acima.
- A tentativa de `npm ci --no-audit --no-fund` excedeu o tempo limite desta sessão; `node_modules` não foi instalado.
- A estrutura do banco JSON foi inspecionada e os quantitativos de objetivas/dissertativas foram recalculados com o parser atualizado.

**Ainda não foi possível declarar build e integração ponta a ponta aprovados:** esta revisão ainda precisa de instalação das dependências frontend/backend, execução de `npm run build` e `npm run lint`, MySQL real com usuário de teste e validação manual no navegador. Nenhum teste de integração com banco remoto foi alegado.

## 8. Pendências reais antes de uma versão 1.0

1. Importar e validar questões ENEM e UNICAMP; conferir extração, numeração, imagens e gabaritos.
2. Auditar individualmente os 431 gabaritos identificados e melhorar a associação entre questão e resposta oficial.
3. Revisar as 163 questões objetivas sem gabarito e vincular respostas oficiais quando disponíveis.
4. Obter espelhos de correção dissertativa e, quando disponíveis, cadastrar critérios específicos por prova/fase.
5. Persistir redações no backend e implementar correção por competências com critérios explícitos.
6. Completar filtros estruturados, favoritos, caderno de erros e revisão espaçada.
7. Completar análise de desempenho por matéria/tópico e comparar tentativas.
8. Implementar administração com papéis e autorização no backend; a interface atual não deve ser tratada como painel administrativo seguro.
9. Completar recuperação de senha, notificações, testes automatizados, logs/monitoramento e fluxo de publicação.
10. Rodar build, lint, testes e cenários de MySQL após instalar dependências no ambiente de desenvolvimento.

## Conclusão

Esta revisão corrige problemas concretos no reconhecimento das alternativas, cria simulados aleatórios vinculados ao acervo real, registra respostas dissertativas, habilita feedback formativo opcional por IA e leva o cronograma para persistência no servidor. **Ainda não é correto declarar o CapVest versão 1.0 finalizada** enquanto a cobertura ENEM/UNICAMP, as correções oficiais abertas, administração, redações persistentes e testes de produção não estiverem resolvidos.
