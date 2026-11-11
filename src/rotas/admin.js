import { createHash, timingSafeEqual } from 'node:crypto';
import { Router, json } from 'express';
import { validarClinica } from '../clinicas.js';

const resumo = (texto) => createHash('sha256').update(String(texto)).digest();

// Painel provisório: cadastro de clínicas e lista de cliques.
// Protegido pela senha ADMIN_TOKEN, enviada no cabeçalho Authorization: Bearer <senha>.
export function rotasDoAdmin({ banco, clinicas, senha }) {
  const rotas = Router();
  rotas.use(json({ limit: '20kb' }));

  rotas.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!senha) return res.status(503).json({ erro: 'Painel desligado: defina ADMIN_TOKEN no servidor.' });
    const enviado = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!enviado || !timingSafeEqual(resumo(enviado), resumo(senha))) {
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }
    return next();
  });

  rotas.get('/clinicas', async (req, res) => {
    const { rows } = await banco.consulta(`
      select c.slug, c.nome, c.whatsapp, c.mensagem, c.ativa, c.criada_em,
             count(q.id) filter (where not q.robo)::int as cliques_total,
             count(q.id) filter (where not q.robo and q.criado_em > now() - interval '7 days')::int as cliques_7_dias
        from clinicas c
        left join cliques q on q.clinica_id = c.id
       group by c.id
       order by c.nome`);
    res.json({ clinicas: rows });
  });

  rotas.post('/clinicas', async (req, res) => {
    const { dados, erro } = validarClinica(req.body || {});
    if (erro) return res.status(400).json({ erro });

    const campos = ['slug', 'nome', 'whatsapp'];
    const valores = [dados.slug, dados.nome, dados.whatsapp];
    if (dados.mensagem) {
      campos.push('mensagem');
      valores.push(dados.mensagem);
    }
    const { rows } = await banco.consulta(
      `insert into clinicas (${campos.join(', ')})
       values (${campos.map((_, i) => `$${i + 1}`).join(', ')})
       on conflict (slug) do nothing
       returning slug, nome, whatsapp, mensagem, ativa`,
      valores,
    );
    if (rows.length === 0) return res.status(409).json({ erro: 'Já existe uma clínica com esse endereço.' });
    clinicas.esquecer(dados.slug);
    return res.status(201).json({ clinica: rows[0] });
  });

  rotas.patch('/clinicas/:slug', async (req, res) => {
    const { dados, erro } = validarClinica(req.body || {}, { parcial: true });
    if (erro) return res.status(400).json({ erro });
    delete dados.slug; // o endereço não muda: links já publicados dependem dele

    const campos = Object.keys(dados);
    if (campos.length === 0) return res.status(400).json({ erro: 'Nada para alterar.' });

    const { rows } = await banco.consulta(
      `update clinicas set ${campos.map((campo, i) => `${campo} = $${i + 2}`).join(', ')}
        where slug = $1
        returning slug, nome, whatsapp, mensagem, ativa`,
      [req.params.slug, ...campos.map((campo) => dados[campo])],
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Clínica não encontrada.' });
    clinicas.esquecer(req.params.slug);
    return res.json({ clinica: rows[0] });
  });

  rotas.get('/cliques', async (req, res) => {
    const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 50, 1), 500);
    const slug = req.query.clinica ? String(req.query.clinica) : null;
    const comRobos = req.query.robos === '1';
    const { rows } = await banco.consulta(
      `select q.id, c.slug as clinica, q.origem, q.codigo, q.visitante_id, q.robo,
              q.lead_id is not null as vinculado, q.criado_em
         from cliques q
         join clinicas c on c.id = q.clinica_id
        where ($1::text is null or c.slug = $1)
          and ($2::boolean or not q.robo)
        order by q.criado_em desc
        limit $3`,
      [slug, comRobos, limite],
    );
    res.json({ cliques: rows });
  });

  return rotas;
}
