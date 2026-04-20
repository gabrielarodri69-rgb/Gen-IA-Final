# 📚 BookBot — Assistente Virtual de Vendas da PageStore

BookBot é um agente conversacional com Inteligência Artificial desenvolvido para a **PageStore**, uma livraria online fictícia. Ele atende clientes 24h por dia, recomenda livros, responde dúvidas sobre políticas da loja e encaminha para atendimento humano quando necessário.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [API — Endpoints](#api--endpoints)
- [Fluxo de Processamento](#fluxo-de-processamento)
- [Base de Conhecimento](#base-de-conhecimento)
- [Testes](#testes)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Decisões Técnicas](#decisões-técnicas)

---

## Visão Geral

| Campo | Valor |
|-------|-------|
| **Nome do agente** | BookBot |
| **Loja** | PageStore (fictícia) |
| **Segmento** | E-commerce de Livros |
| **Canal** | API REST (integrável com chat de site ou WhatsApp) |
| **Modelo de IA** | GPT-4o-mini via API da OpenAI |
| **Runtime** | Node.js 18+ |
| **Framework** | Express 4 |

### Capacidades

- Boas-vindas automáticas no primeiro contato
- Resposta a perguntas frequentes (FAQ) **sem custo de API** via lookup local
- Recomendação de livros com base em gênero e orçamento
- Busca semântica local no catálogo para enriquecer o contexto enviado à IA
- Histórico de conversa por sessão com janela deslizante configurável
- Detecção automática de pedidos de escalada para humano
- Rate limiting, validação de entrada e tratamento centralizado de erros

---

## Estrutura do Projeto

```
bookbot/
├── config/
│   └── index.js              # Lê variáveis de ambiente e exporta configuração tipada
│
├── src/
│   ├── index.js              # Entry point — configura e inicia o servidor Express
│   │
│   ├── agent/
│   │   ├── bookbot.js        # Lógica central do agente (orquestra FAQ → busca → OpenAI)
│   │   ├── memory.js         # SessionStore — histórico de conversa em memória
│   │   └── prompts.js        # System prompt, mensagem de boas-vindas e encerramento
│   │
│   ├── knowledge/
│   │   ├── catalog.js        # Catálogo de livros + funções de busca e formatação
│   │   └── policies.js       # Políticas da loja (frete, pagamento, trocas) + FAQ
│   │
│   ├── routes/
│   │   ├── chat.js           # Endpoints: POST /chat, POST /session, DELETE, GET /catalog
│   │   └── health.js         # GET /health para monitoramento
│   │
│   ├── middleware/
│   │   └── errorHandler.js   # Middleware global de erros do Express
│   │
│   └── utils/
│       ├── logger.js          # Logger winston (console + arquivo em produção)
│       └── validator.js       # Validação e sanitização de entrada
│
├── tests/
│   ├── catalog.test.js        # Testes unitários do catálogo de livros
│   ├── policies.test.js       # Testes unitários das políticas e FAQ
│   ├── memory.test.js         # Testes unitários do SessionStore
│   ├── validator.test.js      # Testes unitários do validador
│   └── routes.test.js         # Testes de integração das rotas (OpenAI mockada)
│
├── docs/
│   └── api.md                 # Referência detalhada dos endpoints com exemplos curl
│
├── .env.example               # Modelo de arquivo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

---

## Pré-requisitos

- **Node.js** versão 18 ou superior
- **npm** versão 8 ou superior
- Uma **chave de API da OpenAI** (obtenha em [platform.openai.com](https://platform.openai.com))

---

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/sua-org/bookbot.git
cd bookbot

# 2. Instale as dependências
npm install
```

---

## Configuração

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env e preencha sua chave da OpenAI
OPENAI_API_KEY=sk-sua-chave-aqui
```

Veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente) para todas as opções disponíveis.

---

## Como Executar

```bash
# Desenvolvimento (com hot-reload via nodemon)
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3000`.

---

## API — Endpoints

Consulte o arquivo [`docs/api.md`](docs/api.md) para a referência completa.

### Resumo rápido

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Health check |
| `POST` | `/api/chat/session` | Cria uma nova sessão |
| `POST` | `/api/chat` | Envia mensagem e recebe resposta |
| `GET` | `/api/chat/catalog` | Lista livros disponíveis |
| `DELETE` | `/api/chat/:sessionId` | Reseta histórico de sessão |

### Exemplo de conversa

```bash
# 1. Cria sessão
curl -X POST http://localhost:3000/api/chat/session
# → { "sessionId": "550e8400-e29b-41d4-a716-446655440000" }

# 2. Primeira mensagem (retorna boas-vindas)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"550e8400-...","message":"oi"}'
# → { "reply": "Olá! 👋 Seja bem-vindo(a) à PageStore!...", "source": "welcome" }

# 3. Pergunta sobre livro (respondido via FAQ local, sem custo de API)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"550e8400-...","message":"qual o frete?"}'
# → { "reply": "Para capitais, o prazo é...", "source": "faq" }

# 4. Pedido de recomendação (processado pela OpenAI)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"550e8400-...","message":"quero um livro de fantasia até R$ 100"}'
# → { "reply": "Ótima escolha!...", "source": "openai" }
```

---

## Fluxo de Processamento

Cada mensagem recebida passa pelas seguintes etapas em ordem:

```
Mensagem do usuário
        │
        ▼
┌───────────────────┐
│ 1. Primeiro       │  isFirstMessage?  →  retorna WELCOME_MESSAGE
│    contato?       │                      (sem custo de API)
└───────────────────┘
        │ não
        ▼
┌───────────────────┐
│ 2. FAQ local      │  gatilho encontrado?  →  retorna resposta FAQ
│                   │                          (sem custo de API)
└───────────────────┘
        │ não
        ▼
┌───────────────────┐
│ 3. Busca local    │  enriquece o contexto com livros
│    no catálogo    │  relevantes antes de chamar a IA
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 4. OpenAI API     │  envia system prompt + histórico + mensagem
│                   │  recebe resposta do modelo
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 5. Detecta        │  verifica se deve sinalizar escalada
│    escalada?      │  para atendimento humano
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 6. Persiste       │  salva mensagem + resposta no SessionStore
│    no histórico   │  (janela deslizante configurável)
└───────────────────┘
        │
        ▼
   Resposta ao cliente
   { reply, escalate, source }
```

**Campo `source`** indica a origem da resposta:
- `welcome` — mensagem de boas-vindas
- `faq` — respondido localmente, sem custo de API
- `openai` — processado pelo modelo de linguagem

---

## Base de Conhecimento

### Catálogo (`src/knowledge/catalog.js`)

Contém os 5 livros disponíveis na PageStore com todos os dados necessários para o bot responder:

| Livro | Gênero | Preço |
|-------|--------|-------|
| O Senhor dos Anéis — Tolkien | Fantasia / Aventura | R$ 189,90 |
| Hábitos Atômicos — James Clear | Autoajuda | R$ 49,90 |
| Dom Casmurro — Machado de Assis | Clássico Brasileiro | R$ 29,90 |
| Clean Code — Robert C. Martin | Programação | R$ 89,90 |
| Harry Potter e a Pedra Filosofal — J.K. Rowling | Fantasia / Infantil | R$ 79,90 |

Funções exportadas:

| Função | Descrição |
|--------|-----------|
| `buscarPorGeneroOuPalavra(query)` | Filtra por gênero, palavras-chave, título ou autor |
| `buscarPorOrcamento(max)` | Retorna livros com preço ≤ max |
| `listarDisponiveis()` | Retorna livros com estoque disponível |
| `formatarLivro(livro)` | Formata um livro para exibição no chat |

### Políticas (`src/knowledge/policies.js`)

Contém as regras de negócio da loja e o sistema de FAQ por gatilhos. Perguntas com palavras como "frete", "pix", "troca" são respondidas localmente sem chamar a OpenAI.

---

## Testes

```bash
# Rodar todos os testes
npm test

# Rodar com cobertura
npm test -- --coverage

# Modo watch (durante o desenvolvimento)
npm run test:watch
```

### Cobertura dos testes

| Arquivo de teste | O que testa |
|-----------------|-------------|
| `catalog.test.js` | Funções de busca, formatação e integridade do catálogo |
| `policies.test.js` | Valores das políticas e sistema de FAQ por gatilhos |
| `memory.test.js` | SessionStore: criação, adição, janela deslizante e limpeza |
| `validator.test.js` | Validação de entrada e sanitização de mensagens |
| `routes.test.js` | Integração dos endpoints REST (OpenAI mockada) |

> **Nota:** Os testes de rota mocam o módulo `bookbot.js` para evitar chamadas reais à OpenAI e garantir execução rápida e sem custo.

---

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `OPENAI_API_KEY` | — | **Obrigatória.** Chave de API da OpenAI |
| `OPENAI_MODEL` | `gpt-4o-mini` | Modelo a utilizar |
| `OPENAI_MAX_TOKENS` | `500` | Máximo de tokens na resposta |
| `OPENAI_TEMPERATURE` | `0.7` | Criatividade do modelo (0 = determinístico, 1 = criativo) |
| `PORT` | `3000` | Porta do servidor HTTP |
| `NODE_ENV` | `development` | Ambiente (`development` \| `production`) |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Janela do rate limit em ms (padrão: 1 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `30` | Máx. requisições por janela por IP |
| `SESSION_MAX_MESSAGES` | `20` | Máx. mensagens mantidas no histórico por sessão |
| `SESSION_TTL_MS` | `1800000` | Tempo de expiração de sessão em ms (padrão: 30 min) |

---

## Decisões Técnicas

**Por que FAQ local antes da OpenAI?**
Perguntas sobre frete, pagamento e trocas são frequentes e têm respostas fixas. Respondê-las localmente reduz latência, elimina custo de API e garante consistência.

**Por que SessionStore em memória?**
Simplicidade para o MVP. Em produção, basta substituir o `Map` interno por um cliente Redis — a interface pública do `SessionStore` não muda.

**Por que janela deslizante no histórico?**
Modelos de linguagem têm limite de contexto (context window). Manter apenas as N últimas mensagens garante que o prompt nunca ultrapasse o limite do modelo, mesmo em conversas longas.

**Por que `source` na resposta?**
Permite que o frontend diferencie respostas rápidas (FAQ/welcome) de respostas geradas pela IA, possibilitando animações ou indicadores visuais distintos.

**Por que injetar o catálogo no system prompt?**
Garante que o modelo sempre tenha acesso aos dados mais atuais da loja sem depender de fine-tuning ou RAG externo, mantendo a arquitetura simples.

---

*PageStore • BookBot v1.0.0 • Desafio IA*
