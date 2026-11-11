import { criarApp } from './app.js';
import { criarBanco } from './banco.js';
import { migrar } from './migrar.js';

const porta = Number(process.env.PORT) || 3000;
const senhaAdmin = (process.env.ADMIN_TOKEN || '').trim();

const banco = criarBanco(process.env.DATABASE_URL);
await migrar(banco);

if (!senhaAdmin) console.warn('[aviso] ADMIN_TOKEN não definida: o painel /admin está desligado.');

const servidor = criarApp({ banco, senhaAdmin }).listen(porta, () => {
  console.log(`[sentinela] no ar na porta ${porta}`);
});

for (const sinal of ['SIGTERM', 'SIGINT']) {
  process.on(sinal, () => {
    servidor.close(() => banco.fecha().finally(() => process.exit(0)));
  });
}
