import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PASTA = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

// Aplica, em ordem, os arquivos de migrations/ que ainda não foram aplicados.
// Cada arquivo roda dentro de uma transação: ou entra inteiro, ou não entra.
export async function migrar(banco, { pasta = PASTA, log = console.log } = {}) {
  await banco.executa(`
    create table if not exists migracoes (
      nome        text primary key,
      aplicada_em timestamptz not null default now()
    )`);

  const { rows } = await banco.consulta('select nome from migracoes');
  const aplicadas = new Set(rows.map((linha) => linha.nome));

  const arquivos = (await readdir(pasta)).filter((nome) => nome.endsWith('.sql')).sort();
  const novas = [];

  for (const nome of arquivos) {
    if (aplicadas.has(nome)) continue;
    const sql = await readFile(path.join(pasta, nome), 'utf8');
    const registro = `insert into migracoes (nome) values ('${nome.replace(/'/g, "''")}');`;
    try {
      await banco.transacao(`${sql}\n${registro}`);
    } catch (erro) {
      throw new Error(`Migração ${nome} falhou: ${erro.message}`);
    }
    novas.push(nome);
    log(`[migrar] aplicada: ${nome}`);
  }

  return novas;
}

// Uso direto: npm run migrar
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { criarBanco } = await import('./banco.js');
  const banco = criarBanco(process.env.DATABASE_URL);
  try {
    const novas = await migrar(banco);
    if (novas.length === 0) console.log('[migrar] nada novo para aplicar');
  } finally {
    await banco.fecha();
  }
}
