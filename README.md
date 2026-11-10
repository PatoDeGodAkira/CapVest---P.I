# CapVest — Plataforma de preparação para vestibulares

O CapVest é uma aplicação web em React para apoiar a preparação para ENEM, UNICAMP e FUVEST. Esta entrega reúne a base original do projeto e novas áreas de simulados, redações, cronograma e análise de desempenho. O projeto continua sendo um produto acadêmico em desenvolvimento: veja `AUDITORIA_TECNICA.md` para conhecer limitações e testes que ainda dependem do ambiente local.

## Funcionalidades disponíveis

### Conta e navegação
- Landing page pública, cadastro e login com senha criptografada (`bcryptjs`) e sessão JWT.
- Áreas internas protegidas e menu lateral com os principais destinos.
- Perfil com foto personalizável, dados pessoais e estatísticas disponíveis.

### Estudo
- Busca de questões indexadas nos PDFs, filtro por vestibular e conferência de resposta quando há gabarito.
- Assistente Capy flutuante para pesquisar questões por tema. Sem chave de IA, usa busca lexical; com Gemini/Anthropic configurado no backend, expande os termos e seleciona questões relevantes.
- Biblioteca por vestibular, categoria e ano, com visualizador de documentos PDF.
- Simulados aleatórios: o servidor sorteia questões já existentes no índice, exclusivamente do vestibular e filtros selecionados. Não cria questões e não mistura acervos. A sessão, respostas e resultado são persistidos no MySQL; respostas são salvas automaticamente.
- Questões objetivas: extração de alternativas nos formatos `(A)`, `A)` e equivalentes; respostas podem ser registradas mesmo sem gabarito, mas a correção automática só ocorre quando existe resposta oficial associada.
- Questões dissertativas: editor de resposta, persistência no servidor e status de revisão. Com Gemini/Anthropic configurado, o estudante pode solicitar uma devolutiva formativa por IA, sem apresentar uma nota como se fosse oficial.
- Provas individuais: navegação, tempo decorrido, rascunho local, submissão e correção de questões objetivas com gabarito; respostas abertas são registradas.
- Redações: editor, tema, contagem de palavras, salvamento e consulta/exclusão dos textos neste navegador.
- Cronograma: objetivo/vestibular/curso/data da prova, carga semanal, disponibilidade por dia, matérias, prioridades, tópicos, geração de atividades para quatro semanas, tarefas manuais e conclusão; os dados ficam no MySQL.
- Desempenho: consulta XP, questões respondidas e precisão pela API de progresso.
- Comunidade: mural local para compartilhar publicações no navegador atual (não é feed online entre usuários).

### Gamificação e notícias
- XP, nível, sequência diária, conquistas básicas e ranking consultados no MySQL.
- Feed RSS de notícias na página inicial, com cache no backend; depende de acesso externo à internet.

## Limitações conhecidas desta entrega

- Redações ainda não têm correção automática por competências, avaliação por IA, histórico completo de versões nem persistência no servidor.
- O editor de redações e o mural da comunidade ainda usam `localStorage`: os dados ficam no navegador/dispositivo atual e não sincronizam entre dispositivos nem entre estudantes. O cronograma foi migrado para persistência no MySQL.
- O módulo de administração com permissões e operações administrativas seguras no backend ainda não está implementado.
- A análise de desempenho usa os indicadores existentes; não há ainda análise granular completa por tópico, tempo, previsão de nota ou comparação mensal.
- O banco de questões tem busca textual e filtro por vestibular; filtros estruturados completos por matéria/dificuldade, caderno de erros e revisão espaçada ainda precisam de implementação.
- A IA do Capy é opcional e depende de chave válida no backend. Sem ela, a busca local continua disponível; não há garantia de disponibilidade, gratuidade ou quota do provedor.
- O índice incluído contém somente FUVEST: 1.450 registros indexados, 1.265 questões numeradas, 594 objetivas (431 com gabarito identificado) e 671 dissertativas. ENEM e UNICAMP aparecem na biblioteca documental, mas ainda não possuem questões no índice atual; por isso, o gerador de simulados os bloqueia até que o acervo seja importado.
- 163 questões objetivas identificadas ainda não têm gabarito vinculado e não entram na seleção de simulados compostos apenas por objetivas corrigíveis. Questões dissertativas são salvas, mas só recebem feedback formativo por IA se uma chave de provedor estiver configurada; esse feedback não é correção oficial da banca.
- Recursos externos (MySQL, RSS, Gemini/Anthropic) só podem ser validados após configuração local.

## Tecnologias
- Frontend: React 19, JavaScript, Vite, React Router, CSS Modules e React Icons.
- Backend: Node.js, Express 5, MySQL2, JWT e bcryptjs.
- Documentos: PDFs locais, extração/indexação com `pdfjs-dist`.
- IA opcional: Gemini ou Anthropic, configurados exclusivamente no backend.

## Requisitos
- Node.js 22 LTS recomendado (Node 20.19+ compatível com a versão atual do Vite).
- npm 10+.
- MySQL 8 ou compatível.
- Internet para instalar dependências e acessar notícias/provedor de IA.

## Instalação

### 1. Banco de dados
Execute `DB.sql` no MySQL:

```bash
mysql -u root -p < DB.sql
```

O backend utiliza o banco `Capvest`. Confira também `backend/migrations/001_gamification.sql`, `002_avatar_storage.sql` e `003_learning_workflows.sql`. As tabelas de gamificação, simulados, respostas abertas e cronograma são verificadas/criadas na inicialização do backend; a coluna de avatar é ampliada pelo servidor ou pode ser migrada manualmente.

### 2. Backend

```bash
cd backend
npm install
```

Copie `backend/.env.example` para `backend/.env` (PowerShell: `Copy-Item .env.example .env`; CMD: `copy .env.example .env`) e configure:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ifsp
DB_NAME=Capvest
JWT_SECRET=Py+iM0RLDoelxAJ3SZxL5L1z7jujb2WFzT6WfLp08AY=
# Opcional: ativa explicações com Gemini no Capy
GEMINI_API_KEY=AQ.Ab8RN6JuA74rCmcWc-I-dgiKn6lI7Bfp4VomHsupZkPeQaKggw

GEMINI_MODEL=gemini-2.5-flash
CAPY_AI_TIMEOUT_MS=20000

# Opcional: o Capy também aceita Anthropic se já houver uma chave.
ANTHROPIC_API_KEY=
```

Gere `JWT_SECRET` com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. As chaves de IA são opcionais e nunca devem ser colocadas em variáveis `VITE_`.

Inicie:

```bash
npm run dev
```

API: `http://localhost:3000`; saúde: `http://localhost:3000/api/health`.

### 3. Frontend
Em outro terminal, na raiz do projeto:

```bash
npm install
```

Copie `.env.example` para `.env` e confira `VITE_API_URL=http://localhost:3000`. Inicie:

```bash
npm run dev
```

Abra o endereço do Vite, normalmente `http://localhost:5173`.

## Comandos úteis
Na raiz:

```bash
npm run dev          # frontend
npm run dev:backend  # backend
npm run build        # build de produção do frontend
npm run lint         # ESLint
npm run ingest       # indexa os PDFs em public/documents
npm run audit:questions # audita quantidade/tipo/gabaritos do índice
```

## Biblioteca e indexação
Organize PDFs em `public/documents/<vestibular>/<categoria>/<ano>/<arquivo>.pdf`, por exemplo `public/documents/fuvest/provas/2024/prova.pdf`. Categorias aceitas: `provas`, `gabaritos`, `editais` e `manuais`. Execute `npm run ingest` na raiz para atualizar o catálogo e índice de questões. PDFs escaneados podem exigir OCR externo; a extração de texto não garante reconhecer todas as questões.

## Estrutura

```text
CapVest/
├── backend/       # API, controllers, serviços, migrações e indexador
├── public/        # imagens, ícones e PDFs
├── src/components # componentes reutilizáveis
├── src/pages      # páginas React
├── src/routes     # rotas e proteção de páginas
├── src/services   # comunicação com a API
├── DB.sql
└── package.json
```

## Segurança e publicação
- Não publique `.env`, segredos JWT ou chaves de IA.
- Configure `FRONTEND_ORIGIN` no backend para restringir CORS no ambiente publicado.
- Use HTTPS, credenciais MySQL com privilégio mínimo e backups.
- Antes de publicar, execute build/lint/testes em ambiente com dependências instaláveis e valide fluxos com banco real. Esta entrega não inclui suíte automatizada completa nem pipeline de deploy.
