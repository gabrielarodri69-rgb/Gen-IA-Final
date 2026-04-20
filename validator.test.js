'use strict';

const { validateChatRequest, sanitize } = require('../src/utils/validator');

describe('validateChatRequest', () => {
  test('deve aceitar requisição válida', () => {
    const { valid } = validateChatRequest({ message: 'Olá!', sessionId: 'session-12345678' });
    expect(valid).toBe(true);
  });

  test('deve rejeitar message ausente', () => {
    const { valid, errors } = validateChatRequest({ sessionId: 'session-12345678' });
    expect(valid).toBe(false);
    expect(errors.join('')).toMatch(/message/);
  });

  test('deve rejeitar message vazia', () => {
    const { valid } = validateChatRequest({ message: '   ', sessionId: 'session-12345678' });
    expect(valid).toBe(false);
  });

  test('deve rejeitar message muito longa', () => {
    const { valid } = validateChatRequest({ message: 'a'.repeat(1001), sessionId: 'session-12345678' });
    expect(valid).toBe(false);
  });

  test('deve rejeitar sessionId ausente', () => {
    const { valid, errors } = validateChatRequest({ message: 'Oi' });
    expect(valid).toBe(false);
    expect(errors.join('')).toMatch(/sessionId/);
  });

  test('deve rejeitar sessionId com formato inválido', () => {
    const { valid } = validateChatRequest({ message: 'Oi', sessionId: 'a b c' });
    expect(valid).toBe(false);
  });
});

describe('sanitize', () => {
  test('deve remover < e >', () => {
    expect(sanitize('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  test('deve manter texto normal', () => {
    expect(sanitize('  Olá, quero um livro!  ')).toBe('Olá, quero um livro!');
  });
});
