'use strict';

/**
 * Testes de integração das rotas da API.
 * A chamada à OpenAI é mockada para não gerar custos nos testes.
 */

// Mock do agente para isolar os testes de rota
jest.mock('../src/agent/bookbot', () => ({
  processMessage: jest.fn().mockResolvedValue({
    reply: 'Olá! Bem-vindo à PageStore!',
    escalate: false,
    source: 'welcome',
  }),
  resetSession: jest.fn(),
  listarCatalogo: jest.fn().mockReturnValue('📚 Catálogo de livros...'),
}));

const request = require('supertest');
const app = require('../src/index');

describe('GET /', () => {
  it('deve retornar informações da API', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'BookBot API');
  });
});

describe('GET /health', () => {
  it('deve retornar status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('sessions');
  });
});

describe('POST /api/chat/session', () => {
  it('deve criar um novo sessionId', async () => {
    const res = await request(app).post('/api/chat/session');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('sessionId');
    expect(typeof res.body.sessionId).toBe('string');
  });
});

describe('POST /api/chat', () => {
  const validBody = { sessionId: 'test-session-xyz-1234', message: 'Olá!' };

  it('deve responder com reply e sessionId', async () => {
    const res = await request(app).post('/api/chat').send(validBody);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply');
    expect(res.body).toHaveProperty('sessionId');
    expect(res.body).toHaveProperty('escalate');
  });

  it('deve retornar 400 se message estiver ausente', async () => {
    const res = await request(app).post('/api/chat').send({ sessionId: 'test-session-xyz-1234' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('deve retornar 400 se sessionId estiver ausente', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'Oi' });
    expect(res.status).toBe(400);
  });

  it('deve retornar 400 se message for muito longa', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ sessionId: 'test-session-xyz-1234', message: 'a'.repeat(1001) });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/chat/catalog', () => {
  it('deve retornar o catálogo de livros', async () => {
    const res = await request(app).get('/api/chat/catalog');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('catalog');
  });
});

describe('DELETE /api/chat/:sessionId', () => {
  it('deve resetar a sessão com sucesso', async () => {
    const res = await request(app).delete('/api/chat/test-session-xyz-1234');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});

describe('404', () => {
  it('deve retornar 404 para rota inexistente', async () => {
    const res = await request(app).get('/rota-inexistente');
    expect(res.status).toBe(404);
  });
});
