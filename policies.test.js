'use strict';

const { POLICIES, buscarFAQ } = require('../src/knowledge/policies');

describe('Políticas da Loja', () => {
  test('frete grátis deve ser a partir de R$ 99', () => {
    expect(POLICIES.frete.freteGratisMinimo).toBe(99.00);
  });

  test('parcelamento máximo no cartão deve ser 6x', () => {
    expect(POLICIES.pagamento.cartaoCredito.parcelasMax).toBe(6);
  });

  test('desconto PIX deve ser 10%', () => {
    expect(POLICIES.pagamento.pix.desconto).toBe(0.10);
  });

  test('prazo de devolução deve ser 7 dias', () => {
    expect(POLICIES.trocaDevolucao.prazoDesistenciaDias).toBe(7);
  });
});

describe('FAQ', () => {
  test('buscarFAQ("frete") deve retornar resposta sobre entrega', () => {
    const resposta = buscarFAQ('qual o frete?');
    expect(resposta).not.toBeNull();
    expect(resposta.toLowerCase()).toMatch(/prazo|dias/);
  });

  test('buscarFAQ("pix") deve retornar resposta sobre pagamento', () => {
    const resposta = buscarFAQ('aceita pix?');
    expect(resposta).not.toBeNull();
    expect(resposta.toLowerCase()).toContain('pix');
  });

  test('buscarFAQ("troca") deve retornar resposta sobre devolução', () => {
    const resposta = buscarFAQ('como faço uma troca?');
    expect(resposta).not.toBeNull();
    expect(resposta).toContain('7 dias');
  });

  test('buscarFAQ com mensagem sem gatilho deve retornar null', () => {
    const resposta = buscarFAQ('qual o seu nome?');
    expect(resposta).toBeNull();
  });
});
