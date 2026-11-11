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

  const idDaClinica = async (slug) => {
    const { rows } = await banco.consulta('select id from clinicas where slug = $1', [String(slug)]);
    return rows[0]?.id ?? null;
  };

  rotas.get('/clinicas', async (req, res) => {
    const { rows } = await banco.consulta(`
      select c.slug, c.nome, c.whatsapp, c.mensagem, c.ativa, c.criada_em,
             count(q.id) filter (where not q.robo)::int as cliques_total,
             count(q.id) filter (where not q.robo and q.criado_em > now() - interval '7 days')::int as cliques_7_dias,
             count(q.id) filter (where q.lead_id is not null and q.criado_em > now() - interval '7 days')::int as conversas_7_dias,
             max(q.criado_em) filter (where not q.robo) as ultimo_clique,
             (select count(*) from leads l where l.clinica_id = c.id)::int as leads,
             (select count(distinct e.lead_id) from etapas e join leads l on l.id = e.lead_id
               where l.clinica_id = c.id and e.etapa = 'agendou')::int as agendaram,
             (select count(distinct e.lead_id) from etapas e join leads l on l.id = e.lead_id
               where l.clinica_id = c.id and e.etapa = 'fechou')::int as fecharam
        from clinicas c
        left join cliques q on q.clinica_id = c.id
       group by c.id
       order by c.nome`);
    res.json({ clinicas: rows });
  });

  // Cliques por dia e por origem, no horário de Brasília (UTC-3, sem horário de verão).
  rotas.get('/serie', async (req, res) => {
    const dias = Math.min(Math.max(parseInt(req.query.dias, 10) || 14, 1), 90);
    const slug = req.query.clinica ? String(req.query.clinica) : null;
    const { rows } = await banco.consulta(
      `select to_char((q.criado_em at time zone 'UTC') - interval '3 hours', 'YYYY-MM-DD') as dia,
              q.origem, count(*)::int as cliques
         from cliques q
         join clinicas c on c.id = q.clinica_id
        where not q.robo
          and q.criado_em > now() - ($2::int + 1) * interval '1 day'
          and ($1::text is null or c.slug = $1)
        group by 1, 2
        order by 1`,
      [slug, dias],
    );
    res.json({ dias, serie: rows });
  });

  // Um "link" é uma origem que já recebeu clique (bio, stories, destaque...).
  rotas.get('/clinicas/:slug/links', async (req, res) => {
    const id = await idDaClinica(req.params.slug);
    if (!id) return res.status(404).json({ erro: 'Clínica não encontrada.' });
    const { rows } = await banco.consulta(
      `select origem,
              count(*) filter (where not robo)::int as cliques_total,
              count(*) filter (where not robo and criado_em > now() - interval '7 days')::int as cliques_7_dias,
              count(*) filter (where lead_id is not null)::int as conversas,
              max(criado_em) filter (where not robo) as ultimo_clique
         from cliques
        where clinica_id = $1
        group by origem
        order by 2 desc, origem`,
      [id],
    );
    return res.json({ links: rows });
  });

  // Leads da clínica com a linha do tempo (toques) e as etapas de cada uma.
  rotas.get('/clinicas/:slug/leads', async (req, res) => {
    const id = await idDaClinica(req.params.slug);
    if (!id) return res.status(404).json({ erro: 'Clínica não encontrada.' });
    const { rows } = await banco.consulta(
      `select l.id, l.nome, l.telefone, l.ig_username, l.segue_perfil, l.criado_em,
              coalesce((select json_agg(json_build_object(
                          'tipo', t.tipo, 'canal', t.canal, 'quando', t.ocorrido_em, 'detalhes', t.detalhes,
                          'titulo', k.titulo, 'conteudo_tipo', k.tipo, 'conteudo_origem', k.origem)
                        order by t.ocorrido_em)
                          from toques t left join conteudos k on k.id = t.conteudo_id
                         where t.lead_id = l.id), '[]'::json) as toques,
              coalesce((select json_agg(json_build_object('etapa', e.etapa, 'valor', e.valor, 'quando', e.ocorrido_em)
                        order by e.ocorrido_em)
                          from etapas e where e.lead_id = l.id), '[]'::json) as etapas
         from leads l
        where l.clinica_id = $1
        order by l.atualizado_em desc
        limit 200`,
      [id],
    );
    return res.json({ leads: rows });
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
