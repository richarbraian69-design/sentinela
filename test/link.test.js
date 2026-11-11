import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { extrairCodigo } from '../src/codigo.js';
import { migrar } from '../src/migrar.js';
import { NAVEGADOR_INSTAGRAM, bancoDeTeste, servidorDeTeste } from './apoio.js';

let banco;
let servidor;

before(async () => {
  banco = await bancoDeTeste();
  servidor = await servidorDeTeste(banco);
  const resposta = await servidor.admin('/clinicas', {
    method: 'POST',
    body: { slug: 'dra-ana', nome: 'Dra. Ana', whatsapp: '55 51 99999-0000' },
  });
  assert.equal(resposta.status, 201);
});

after(async () => {
  await servidor.fecha();
  await banco.fecha();
});

const comoPessoa = (extra = {}) => ({ headers: { 'user-agent': NAVEGADOR_INSTAGRAM, ...extra } });
const cliques = async () => (await banco.consulta('select * from cliques order by id')).rows;

test('rodar as migrações de novo não muda nada', async () => {
  assert.deepEqual(await migrar(banco, { log: () => {} }), []);
});

test('clique na bio: registra, gera código e leva ao WhatsApp da clínica', async () => {
  const resposta = await servidor.chamar('/dra-ana/bio', comoPessoa());
  assert.equal(resposta.status, 302);
  assert.equal(resposta.headers.get('cache-control'), 'no-store');

  const destino = new URL(resposta.headers.get('location'));
  assert.equal(destino.origin + destino.pathname, 'https://wa.me/5551999990000');
  const codigo = extrairCodigo(destino.searchParams.get('text'));
  assert.ok(codigo, 'a mensagem leva o código');

  const [clique] = (await cliques()).filter((linha) => linha.codigo === codigo);
  assert.equal(clique.origem, 'bio');
  assert.equal(clique.robo, false);
  assert.equal(clique.lead_id, null);
  assert.match(resposta.headers.get('set-cookie'), new RegExp(`snt_v=${clique.visitante_id}`));
});

test('sem origem no link, vale como bio; outra origem fica registrada', async () => {
  const semOrigem = await servidor.chamar('/dra-ana', comoPessoa());
  const stories = await servidor.chamar('/DRA-ANA/Stories', comoPessoa());
  assert.equal(semOrigem.status, 302);
  assert.equal(stories.status, 302);

  const origens = (await cliques()).map((linha) => linha.origem);
  assert.ok(origens.includes('stories'));
  assert.equal(origens.filter((origem) => origem === 'bio').length, 2);
});

test('mesmo navegador volta: novo código, mesmo visitante', async () => {
  const primeira = await servidor.chamar('/dra-ana/destaque', comoPessoa());
  const cookie = primeira.headers.get('set-cookie').split(';')[0];
  const segunda = await servidor.chamar('/dra-ana/destaque', comoPessoa({ cookie }));

  const doDestaque = (await cliques()).filter((linha) => linha.origem === 'destaque');
  assert.equal(doDestaque.length, 2);
  assert.equal(doDestaque[0].visitante_id, doDestaque[1].visitante_id);
  assert.notEqual(doDestaque[0].codigo, doDestaque[1].codigo);
  assert.equal(segunda.status, 302);
});

test('robô é levado ao WhatsApp sem código e fica marcado', async () => {
  const resposta = await servidor.chamar('/dra-ana/bio', { headers: { 'user-agent': 'facebookexternalhit/1.1' } });
  assert.equal(resposta.status, 302);
  assert.equal(extrairCodigo(new URL(resposta.headers.get('location')).searchParams.get('text')), null);

  // o registro do robô não segura a resposta; dá um instante para ele entrar
  await new Promise((pronto) => setTimeout(pronto, 50));
  const robos = (await cliques()).filter((linha) => linha.robo);
  assert.equal(robos.length, 1);
  assert.equal(robos[0].codigo, null);
});

test('clínica inexistente, desativada ou endereço reservado: 404', async () => {
  assert.equal((await servidor.chamar('/nao-existe/bio', comoPessoa())).status, 404);
  assert.equal((await servidor.chamar('/dra-ana/bio/extra', comoPessoa())).status, 404);

  await servidor.admin('/clinicas', { method: 'POST', body: { slug: 'dra-bia', nome: 'Dra. Bia', whatsapp: '5551988887777' } });
  assert.equal((await servidor.chamar('/dra-bia/bio', comoPessoa())).status, 302);
  const desativar = await servidor.admin('/clinicas/dra-bia', { method: 'PATCH', body: { ativa: false } });
  assert.equal(desativar.status, 200);
  assert.equal((await servidor.chamar('/dra-bia/bio', comoPessoa())).status, 404);
});

test('mudar o WhatsApp da clínica vale no clique seguinte', async () => {
  await servidor.admin('/clinicas', { method: 'POST', body: { slug: 'dra-cris', nome: 'Dra. Cris', whatsapp: '5551911112222' } });
  await servidor.chamar('/dra-cris', comoPessoa());
  await servidor.admin('/clinicas/dra-cris', { method: 'PATCH', body: { whatsapp: '55 51 93333-4444', mensagem: 'Oi! {codigo}' } });

  const resposta = await servidor.chamar('/dra-cris', comoPessoa());
  const destino = new URL(resposta.headers.get('location'));
  assert.equal(destino.pathname, '/5551933334444');
  assert.match(destino.searchParams.get('text'), /^Oi! [2-9A-HJ-NP-Z]{5}$/);
});

test('se o banco cair, o link continua levando ao WhatsApp', async () => {
  await servidor.chamar('/dra-ana/bio', comoPessoa()); // garante a clínica em memória
  const original = banco.consulta;
  banco.consulta = () => Promise.reject(new Error('banco fora do ar'));
  try {
    const resposta = await servidor.chamar('/dra-ana/bio', comoPessoa());
    assert.equal(resposta.status, 302);
    assert.match(resposta.headers.get('location'), /^https:\/\/wa\.me\/5551999990000\?text=/);
  } finally {
    banco.consulta = original;
  }
});

test('painel: exige senha, lista clínicas com contagem e cliques sem robôs', async () => {
  assert.equal((await servidor.admin('/clinicas', { senha: 'errada' })).status, 401);
  assert.equal((await servidor.chamar('/admin/api/clinicas')).status, 401);

  const { clinicas } = await (await servidor.admin('/clinicas')).json();
  const ana = clinicas.find((clinica) => clinica.slug === 'dra-ana');
  assert.ok(ana.cliques_total >= 5);
  assert.equal(ana.cliques_total, ana.cliques_7_dias);

  const { cliques: lista } = await (await servidor.admin('/cliques?clinica=dra-ana')).json();
  assert.ok(lista.length >= 5);
  assert.ok(lista.every((clique) => clique.clinica === 'dra-ana' && clique.robo === false));

  const comRobos = await (await servidor.admin('/cliques?clinica=dra-ana&robos=1')).json();
  assert.equal(comRobos.cliques.length, lista.length + 1);
});

test('painel: recusa cadastro repetido ou inválido', async () => {
  const repetido = await servidor.admin('/clinicas', { method: 'POST', body: { slug: 'dra-ana', nome: 'Outra', whatsapp: '5551999990000' } });
  assert.equal(repetido.status, 409);
  const reservado = await servidor.admin('/clinicas', { method: 'POST', body: { slug: 'admin', nome: 'X', whatsapp: '5551999990000' } });
  assert.equal(reservado.status, 400);
  const semNumero = await servidor.admin('/clinicas', { method: 'POST', body: { slug: 'dra-dani', nome: 'Dra. Dani', whatsapp: '123' } });
  assert.equal(semNumero.status, 400);
});

test('sem ADMIN_TOKEN o painel fica desligado, e o link segue funcionando', async () => {
  const semSenha = await servidorDeTeste(banco, { senhaAdmin: '' });
  try {
    assert.equal((await semSenha.admin('/clinicas')).status, 503);
    assert.equal((await semSenha.chamar('/dra-ana/bio', comoPessoa())).status, 302);
    assert.equal((await semSenha.chamar('/saude')).status, 200);
  } finally {
    await semSenha.fecha();
  }
});

test('painel: cliques por dia e por link', async () => {
  const { serie, dias } = await (await servidor.admin('/serie?dias=14&clinica=dra-ana')).json();
  assert.equal(dias, 14);
  assert.ok(serie.every((linha) => /^\d{4}-\d{2}-\d{2}$/.test(linha.dia)));
  const total = serie.reduce((soma, linha) => soma + linha.cliques, 0);

  const { links } = await (await servidor.admin('/clinicas/dra-ana/links')).json();
  assert.deepEqual(links.map((link) => link.origem).sort(), ['bio', 'destaque', 'stories']);
  assert.equal(links.reduce((soma, link) => soma + link.cliques_total, 0), total);
  assert.ok(links.every((link) => link.conversas === 0));

  assert.equal((await servidor.admin('/clinicas/nao-existe/links')).status, 404);
});

test('painel: leads com a linha do tempo em ordem', async () => {
  const vazio = await (await servidor.admin('/clinicas/dra-ana/leads')).json();
  assert.deepEqual(vazio.leads, []);

  const { rows: [clinica] } = await banco.consulta("select id from clinicas where slug = 'dra-ana'");
  const { rows: [lead] } = await banco.consulta(
    "insert into leads (clinica_id, nome, telefone, segue_perfil) values ($1, 'Maria', '5551988880000', true) returning id", [clinica.id]);
  const { rows: [conteudo] } = await banco.consulta(
    "insert into conteudos (clinica_id, origem, id_externo, titulo, tipo) values ($1, 'anuncio', '123', 'Anúncio: avaliação', 'oferta') returning id", [clinica.id]);
  await banco.consulta(
    `insert into toques (clinica_id, lead_id, tipo, canal, conteudo_id, detalhes, ocorrido_em) values
       ($1, $2, 'primeira_mensagem', 'whatsapp', null, '{"texto":"Oi"}', now() - interval '1 day'),
       ($1, $2, 'clique_anuncio_whatsapp', 'whatsapp', $3, '{}', now() - interval '2 days')`, [clinica.id, lead.id, conteudo.id]);
  await banco.consulta("insert into etapas (lead_id, etapa, valor) values ($1, 'agendou', null), ($1, 'fechou', 2800)", [lead.id]);

  const { leads } = await (await servidor.admin('/clinicas/dra-ana/leads')).json();
  assert.equal(leads.length, 1);
  assert.equal(leads[0].nome, 'Maria');
  assert.deepEqual(leads[0].toques.map((toque) => toque.tipo), ['clique_anuncio_whatsapp', 'primeira_mensagem']);
  assert.equal(leads[0].toques[0].titulo, 'Anúncio: avaliação');
  assert.equal(leads[0].toques[0].conteudo_tipo, 'oferta');
  assert.equal(leads[0].toques[1].detalhes.texto, 'Oi');
  assert.equal(leads[0].etapas.length, 2);

  const { clinicas } = await (await servidor.admin('/clinicas')).json();
  const ana = clinicas.find((item) => item.slug === 'dra-ana');
  assert.equal(ana.leads, 1);
  assert.equal(ana.agendaram, 1);
  assert.equal(ana.fecharam, 1);
});

test('painel: página e arquivos são servidos', async () => {
  assert.equal((await servidor.chamar('/admin')).status, 200);
  assert.match((await servidor.chamar('/admin/admin.css')).headers.get('content-type'), /css/);
  assert.match((await servidor.chamar('/admin/admin.js')).headers.get('content-type'), /javascript/);
});
