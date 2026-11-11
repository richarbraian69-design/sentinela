import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import { criarCacheDeClinicas } from './clinicas.js';
import { rotasDoAdmin } from './rotas/admin.js';
import { rotasDoLink } from './rotas/link.js';

const PUBLICO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

export function criarApp({ banco, senhaAdmin }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  const clinicas = criarCacheDeClinicas(banco);

  app.get('/', (req, res) => res.type('text').send('Sentinela'));

  app.get('/saude', async (req, res) => {
    try {
      await banco.consulta('select 1');
      res.json({ ok: true });
    } catch {
      res.status(503).json({ ok: false });
    }
  });

  app.get('/robots.txt', (req, res) => res.type('text').send('User-agent: *\nDisallow: /\n'));
  app.get('/favicon.ico', (req, res) => res.status(204).end());

  app.get('/admin', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.set('X-Robots-Tag', 'noindex, nofollow');
    res.sendFile(path.join(PUBLICO, 'admin.html'));
  });
  app.use('/admin/api', rotasDoAdmin({ banco, clinicas, senha: senhaAdmin }));

  // Por último: tudo o que sobrar é tratado como link rastreado de clínica.
  app.use(rotasDoLink({ banco, clinicas }));

  app.use((req, res) => res.status(404).type('text').send('Não encontrado.'));

  // eslint-disable-next-line no-unused-vars
  app.use((erro, req, res, next) => {
    console.error('[erro]', req.method, req.path, erro.message);
    if (res.headersSent) return;
    const status = erro.status && erro.status < 500 ? erro.status : 500;
    res.status(status).json({ erro: status === 500 ? 'Erro interno.' : 'Requisição inválida.' });
  });

  return app;
}
