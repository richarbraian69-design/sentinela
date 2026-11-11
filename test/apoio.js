import { PGlite } from '@electric-sql/pglite';
import { criarApp } from '../src/app.js';
import { migrar } from '../src/migrar.js';

// Postgres embutido, em memória, com a mesma interface de src/banco.js.
export async function bancoDeTeste() {
  const pg = new PGlite();
  const banco = {
    consulta: (sql, valores = []) => pg.query(sql, valores),
    executa: (sql) => pg.exec(sql),
    transacao: (sql) => pg.transaction((tx) => tx.exec(sql)),
    fecha: () => pg.close(),
  };
  await migrar(banco, { log: () => {} });
  return banco;
}

export const SENHA = 'senha-de-teste';

// Sobe o servidor numa porta livre e devolve um jeito simples de chamar.
export async function servidorDeTeste(banco, { senhaAdmin = SENHA } = {}) {
  const servidor = criarApp({ banco, senhaAdmin }).listen(0);
  await new Promise((pronto) => servidor.once('listening', pronto));
  const base = `http://127.0.0.1:${servidor.address().port}`;

  return {
    base,
    chamar: (caminho, opcoes = {}) => fetch(base + caminho, { redirect: 'manual', ...opcoes }),
    admin: (caminho, { method = 'GET', body, senha = SENHA } = {}) =>
      fetch(`${base}/admin/api${caminho}`, {
        method,
        headers: { Authorization: `Bearer ${senha}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      }),
    fecha: () => new Promise((pronto) => servidor.close(pronto)),
  };
}

export const NAVEGADOR_INSTAGRAM =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0 (iPhone15,2; iOS 18_1; pt_BR)';
