'use strict';

const {
  CATALOG,
  buscarPorGeneroOuPalavra,
  buscarPorOrcamento,
  listarDisponiveis,
  formatarLivro,
} = require('../src/knowledge/catalog');

describe('Catálogo de Livros', () => {
  test('deve conter pelo menos 5 livros', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(5);
  });

  test('cada livro deve ter os campos obrigatórios', () => {
    CATALOG.forEach((livro) => {
      expect(livro).toHaveProperty('id');
      expect(livro).toHaveProperty('titulo');
      expect(livro).toHaveProperty('autor');
      expect(livro).toHaveProperty('preco');
      expect(livro).toHaveProperty('estoque');
      expect(typeof livro.preco).toBe('number');
    });
  });

  test('buscarPorGeneroOuPalavra("fantasia") deve retornar livros de fantasia', () => {
    const resultado = buscarPorGeneroOuPalavra('fantasia');
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach((livro) => {
      const temFantasia =
        livro.genero.includes('fantasia') ||
        livro.palavrasChave.some((p) => p.includes('fantasia'));
      expect(temFantasia).toBe(true);
    });
  });

  test('buscarPorGeneroOuPalavra("tolkien") deve encontrar O Senhor dos Anéis', () => {
    const resultado = buscarPorGeneroOuPalavra('tolkien');
    expect(resultado.some((l) => l.id === 'senhor-dos-aneis')).toBe(true);
  });

  test('buscarPorOrcamento(50) deve retornar somente livros com preço <= 50', () => {
    const resultado = buscarPorOrcamento(50);
    resultado.forEach((livro) => {
      expect(livro.preco).toBeLessThanOrEqual(50);
    });
  });

  test('listarDisponiveis não deve retornar livros com estoque "esgotado"', () => {
    const resultado = listarDisponiveis();
    resultado.forEach((livro) => {
      expect(livro.estoque).not.toBe('esgotado');
    });
  });

  test('formatarLivro deve retornar uma string com título e preço', () => {
    const livro = CATALOG[0];
    const texto = formatarLivro(livro);
    expect(typeof texto).toBe('string');
    expect(texto).toContain(livro.titulo);
    expect(texto).toContain(livro.autor);
  });
});
