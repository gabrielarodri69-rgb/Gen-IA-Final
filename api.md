# BookBot — Referência da API

Base URL: `http://localhost:3000`

---

## Endpoints

### `GET /`
Informações gerais da API.

**Resposta**
```json
{ "name": "BookBot API", "version": "1.0.0" }
```

---

### `GET /health`
Health check para monitoramento.

**Resposta**
```json
{
  "status": "ok",
  "uptime": "120s",
  "environment": "development",
  "sessions": 3,
  "model": "gpt-4o-mini"
}
```

---

### `POST /api/chat/session`
Cria um novo sessionId para iniciar uma conversa.

**Resposta** `201`
```json
{ "sessionId": "550e8400-e29b-41d4-a716-446655440000" }
```

---

### `POST /api/chat`
Envia uma mensagem e recebe a resposta do BookBot.

**Body**
```json
{ "sessionId": "550e8400-...", "message": "Quero um livro de fantasia" }
```

**Resposta** `200`
```json
{
  "reply": "Ótima escolha! Temos O Senhor dos Anéis...",
  "sessionId": "550e8400-...",
  "escalate": false,
  "source": "openai"
}
```

| Campo | Descrição |
|-------|-----------|
| `reply` | Resposta do BookBot |
| `escalate` | `true` se o cliente pediu atendimento humano |
| `source` | `welcome`, `faq` ou `openai` |

**Erros**
| Código | Motivo |
|--------|--------|
| `400` | `message` ou `sessionId` inválidos |
| `429` | Rate limit atingido |
| `500` | Erro interno ou falha na OpenAI |

---

### `GET /api/chat/catalog`
Retorna o catálogo de livros em texto formatado.

**Resposta** `200`
```json
{ "catalog": "📚 Aqui estão os livros disponíveis..." }
```

---

### `DELETE /api/chat/:sessionId`
Reseta o histórico de conversa de uma sessão.

**Resposta** `200`
```json
{ "message": "Sessão 550e8400-... reiniciada com sucesso." }
```

---

## Exemplos com curl

```bash
# 1. Criar sessão
curl -X POST http://localhost:3000/api/chat/session

# 2. Enviar mensagem
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"SEU-SESSION-ID","message":"Quero um livro de fantasia"}'

# 3. Ver catálogo
curl http://localhost:3000/api/chat/catalog

# 4. Resetar sessão
curl -X DELETE http://localhost:3000/api/chat/SEU-SESSION-ID
```
