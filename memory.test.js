'use strict';

// Usa um store de teste isolado para não afetar outros testes
jest.mock('../../config', () => ({
  session: { maxMessages: 4, ttlMs: 1800000 },
  server: { nodeEnv: 'test' },
  openai: {},
  rateLimit: {},
}), { virtual: true });

// Reimporta o módulo para aplicar o mock
jest.resetModules();
const SessionStore = require('../src/agent/memory');

describe('SessionStore', () => {
  const SESSION_ID = 'test-session-abc';

  beforeEach(() => {
    SessionStore.clearSession(SESSION_ID);
  });

  test('isFirst deve retornar true para sessão nova', () => {
    expect(SessionStore.isFirst(SESSION_ID)).toBe(true);
  });

  test('addMessage deve marcar isFirst como false', () => {
    SessionStore.addMessage(SESSION_ID, 'user', 'oi');
    expect(SessionStore.isFirst(SESSION_ID)).toBe(false);
  });

  test('getMessages deve retornar mensagens adicionadas', () => {
    SessionStore.addMessage(SESSION_ID, 'user', 'olá');
    SessionStore.addMessage(SESSION_ID, 'assistant', 'Oi! Como posso ajudar?');
    const msgs = SessionStore.getMessages(SESSION_ID);
    expect(msgs).toHaveLength(2);
    expect(msgs[0]).toEqual({ role: 'user', content: 'olá' });
  });

  test('deve respeitar a janela deslizante de mensagens', () => {
    for (let i = 0; i < 6; i++) {
      SessionStore.addMessage(SESSION_ID, 'user', `msg ${i}`);
    }
    const msgs = SessionStore.getMessages(SESSION_ID);
    // maxMessages = 4 (do mock acima)
    expect(msgs.length).toBeLessThanOrEqual(4);
  });

  test('clearSession deve resetar o histórico', () => {
    SessionStore.addMessage(SESSION_ID, 'user', 'teste');
    SessionStore.clearSession(SESSION_ID);
    expect(SessionStore.getMessages(SESSION_ID)).toHaveLength(0);
    expect(SessionStore.isFirst(SESSION_ID)).toBe(true);
  });
});
