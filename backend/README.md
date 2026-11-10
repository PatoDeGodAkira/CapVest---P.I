# Backend do CapVest

API REST em Express + MySQL. Consulte o [README principal](../README.md) para instalação completa, configuração de ambiente e comandos.

## Execução

```bash
npm install
npm run dev
```

A API usa `backend/.env`. O endpoint de saúde é `GET /api/health`.

## Rotas principais

- `POST /api/auth/register` — cadastro.
- `POST /api/auth/login` — login e emissão JWT.
- `PATCH /api/auth/profile` — atualiza foto/bio/dados de perfil (JWT obrigatório).
- `GET /api/news/` — feed RSS agregado e cacheado.
- `GET /api/progress/me` — progresso do usuário autenticado.
- `GET /api/progress/ranking` — ranking.
- `/api/capy` — pesquisa de questões e explicação assistida.
- `/api/exams` — catálogo e correção de provas.

Não exponha chaves de IA no frontend.

## Fluxos de questões e cronograma

- `GET /api/exams/catalog` — quantitativos reais do índice por vestibular, tipo e ano.
- `POST /api/exams/simulations` — cria simulado aleatório a partir das questões já indexadas.
- `GET /api/exams/simulations/:id` — recupera uma sessão do usuário autenticado.
- `PUT /api/exams/simulations/:id/answers` — salva rascunho de respostas.
- `POST /api/exams/simulations/:id/submit` — finaliza e corrige objetivas com gabarito.
- `POST /api/exams/answer/open` — salva uma resposta dissertativa.
- `POST /api/exams/answer/open/review` — solicita feedback formativo por IA, se o provedor estiver configurado.
- `/api/study` — consulta e gerencia objetivo, disponibilidade, plano e tarefas do cronograma.

As tabelas `user_simulation_sessions`, `user_open_question_responses`, `user_study_plans` e `user_study_tasks` são criadas pelo serviço `Services/learningSchema.js` na inicialização. O SQL correspondente também está documentado em `migrations/003_learning_workflows.sql`.

Para auditar a cobertura atual do banco de questões, execute `npm run audit:questions`. O gerador de simulados não cria questões: quando o vestibular ou a quantidade solicitada não estão disponíveis no índice, a API retorna erro de disponibilidade.
