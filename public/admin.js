(function () {
'use strict';

/* ---------- Constantes ---------- */
var TORRE = '<polygon class="fl" points="56.7,200 100,225 100,255 56.7,230"/><polygon class="fr" points="100,225 143.3,200 143.3,230 100,255"/><polygon class="ft" points="100,175 143.3,200 100,225 56.7,200"/><polygon class="fl" points="70.6,100 100,117 100,217 70.6,200"/><polygon class="fr" points="100,117 129.4,100 129.4,200 100,217"/>';
var TOPO = '<polygon class="fl" points="60.2,78 100,101 100,111 60.2,88"/><polygon class="fr" points="100,101 139.8,78 139.8,88 100,111"/><polygon class="ft" points="100,55 139.8,78 100,101 60.2,78"/>';
var LUME = '<polygon class="fz" points="80.95,60 100,71 100,89 80.95,78"/><polygon class="fz2" points="100,71 119.05,60 119.05,78 100,89"/><polygon class="fl" points="100,30 80.95,60 100,71"/><polygon class="fr" points="100,30 100,71 119.05,60"/>';
var ISO_MARCA = '<svg class="iso" viewBox="25 25 150 240" aria-hidden="true">' + TORRE + TOPO + LUME + '</svg>';
var ISO_TORRE = '<svg class="iso" viewBox="20 20 185 245" aria-hidden="true"><polygon class="fc" points="100,180 169.3,220 100,260 30.7,220"/>' + TORRE +
  '<polygon class="fv" points="80.9,136 89.7,141 89.7,161 80.9,156"/><polygon class="fz" points="110.3,131 119.1,126 119.1,146 110.3,151"/>' + TOPO +
  '<polygon class="feixe" points="119,64 205,28 205,104"/>' + LUME + '</svg>';

var IC = {
  geral: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  jornada: '<circle cx="5" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 7.5l3.3 3M13.7 13.5l3.6 3"/>',
  links: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  cliques: '<path d="M4 20V11M10 20V5M16 20v-6M21 20H3"/>',
  ajustes: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  tema: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  sair: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H10"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  anuncio: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 8.5a5 5 0 0 1 0 7"/>',
  mensagem: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  comentario: '<path d="M4 5h16v11H9l-5 4z"/>',
  story: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  post: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 15l4-4 4 4 3-3 5 5"/>',
  fala: '<path d="M8 10h8M8 14h5"/><path d="M4 5h16v12H10l-4 3v-3H4z"/>',
  marco: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
};
function icone(nome) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[nome] + '</svg>';
}

var VIGILIAS = [
  ['Custos, quid de nocte?', 'Sentinela, que resta da noite?', 'Isaías 21, 11'],
  ['Vigilate et orate.', 'Vigiai e orai.', 'Mateus 26, 41'],
  ['Speculatorem dedi te domui Israel.', 'Eu te pus como sentinela da casa de Israel.', 'Ezequiel 3, 17'],
  ['Nisi Dominus custodierit civitatem, frustra vigilat qui custodit eam.', 'Se o Senhor não guardar a cidade, em vão vigia a sentinela.', 'Salmo 127 (126), 1'],
  ['Super custodiam meam stabo.', 'Ficarei de pé no meu posto de guarda.', 'Habacuc 2, 1']
];

var TOQUES = {
  clique_anuncio_whatsapp: ['Clicou em um anúncio de WhatsApp', 'anuncio'],
  clique_anuncio_direct: ['Clicou em um anúncio de Direct', 'anuncio'],
  comentario: ['Comentou', 'comentario'],
  resposta_story: ['Respondeu a um story', 'story'],
  post_compartilhado: ['Enviou um post no Direct', 'post'],
  clique_link: ['Clicou no link', 'links'],
  primeira_mensagem: ['Mandou a primeira mensagem', 'mensagem'],
  declarado: ['Disse o que já tinha visto', 'fala']
};
var ETAPAS = { agendou: 'Agendou a avaliação', compareceu: 'Compareceu', fechou: 'Fechou', perdido: 'Não seguiu' };
var TIPOS = { antes_depois: 'Antes e depois', depoimento: 'Depoimento', procedimento: 'Procedimento explicado', bastidor: 'Bastidor', oferta: 'Oferta' };
var ORIGENS_PADRAO = ['bio', 'stories', 'destaque'];
var PASSOS = [
  ['1', 'A pessoa clica', 'No link da bio, dos stories ou do destaque.'],
  ['2', 'O Sentinela anota', 'Registra de onde veio o clique e gera um código.'],
  ['3', 'O WhatsApp abre', 'Com a mensagem já escrita e o código no fim. A pessoa só aperta enviar.'],
  ['4', 'A lead ganha origem', 'Quando a mensagem chegar à clínica, o código liga a conversa ao clique.']
];

/* ---------- Utilidades ---------- */
function h(tag, props) {
  var no = document.createElement(tag), i, k;
  props = props || {};
  for (k in props) {
    if (props[k] === null || props[k] === undefined || props[k] === false) continue;
    if (k === 'class') no.className = props[k];
    else if (k === 'text') no.textContent = props[k];
    else if (k === 'svg') no.innerHTML = props[k]; // só constantes deste arquivo
    else if (k.slice(0, 2) === 'on') no.addEventListener(k.slice(2), props[k]);
    else if (k in no && k !== 'list' && k !== 'form') no[k] = props[k];
    else no.setAttribute(k, props[k] === true ? '' : props[k]);
  }
  for (i = 2; i < arguments.length; i += 1) acrescentar(no, arguments[i]);
  return no;
}
function acrescentar(no, filho) {
  if (filho === null || filho === undefined || filho === false) return;
  if (Array.isArray(filho)) filho.forEach(function (f) { acrescentar(no, f); });
  else no.appendChild(typeof filho === 'object' ? filho : document.createTextNode(String(filho)));
}
function guardar(chave, valor) { try { valor ? localStorage.setItem(chave, valor) : localStorage.removeItem(chave); } catch (e) {} }
function lembrar(chave) { try { return localStorage.getItem(chave) || ''; } catch (e) { return ''; } }
function guardarSessao(valor) { try { valor ? sessionStorage.setItem('snt_senha', valor) : sessionStorage.removeItem('snt_senha'); } catch (e) {} }
function lembrarSessao() { try { return sessionStorage.getItem('snt_senha') || ''; } catch (e) { return ''; } }

function isoDe(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function mais(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function dataHora(v) { return new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
function diaMes(v) { return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); }
function hora(v) { return new Date(v).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
function reais(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }
function decimal(n) { return n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }); }

/* ---------- Tempo litúrgico (mesma regra do Ora et Labora) ---------- */
function pascoa(a) {
  var b = a % 19, c = Math.floor(a / 100), d = a % 100, e = Math.floor(c / 4), f = c % 4, g = Math.floor((c + 8) / 25), hh = Math.floor((c - g + 1) / 3), i = (19 * b + c - e - hh + 15) % 30,
    k = Math.floor(d / 4), l = d % 4, m = (32 + 2 * f + 2 * k - i - l) % 7, n = Math.floor((b + 11 * i + 22 * m) / 451), mes = Math.floor((i + m - 7 * n + 114) / 31), dia = ((i + m - 7 * n + 114) % 31) + 1;
  return new Date(a, mes - 1, dia);
}
var FESTAS = { '01-01': ['Santa Maria, Mãe de Deus', 'branco'], '03-19': ['São José', 'branco'], '03-25': ['Anunciação do Senhor', 'branco'], '06-24': ['Natividade de São João Batista', 'branco'], '06-29': ['São Pedro e São Paulo', 'vermelho'], '08-15': ['Assunção de Nossa Senhora', 'branco'], '09-29': ['Santos Arcanjos', 'branco'], '10-02': ['Santos Anjos da Guarda', 'branco'], '10-12': ['Nossa Senhora Aparecida', 'branco'], '11-01': ['Todos os Santos', 'branco'], '11-02': ['Fiéis Defuntos', 'roxo'], '12-08': ['Imaculada Conceição', 'branco'] };
function liturgia(d) {
  var a = d.getFullYear(), ds = isoDe(d), P = pascoa(a), cinzas = mais(P, -46), pent = mais(P, 49);
  var dez3 = new Date(a, 11, 3), adv = mais(dez3, -dez3.getDay()), epi = new Date(a, 0, 2); while (epi.getDay() !== 0) epi = mais(epi, 1);
  var bat = epi.getDate() >= 7 ? mais(epi, 1) : mais(epi, 7), dom = d.getDay() === 0, sem = 0, t = { tempo: 'Tempo Comum', cor: 'verde', festa: '' };
  if (d >= adv && d < new Date(a, 11, 25)) { t.tempo = 'Advento'; t.cor = 'roxo'; sem = Math.floor((d - adv) / 864e5 / 7) + 1; if (dom && sem === 3) t.cor = 'rosa'; }
  else if (d >= new Date(a, 11, 25) || d <= bat) { t.tempo = 'Tempo do Natal'; t.cor = 'branco'; }
  else if (d >= cinzas && d < P) { t.tempo = d >= mais(P, -7) ? 'Semana Santa' : 'Quaresma'; t.cor = 'roxo'; sem = d < mais(cinzas, 4) ? 0 : Math.floor((d - mais(cinzas, 4)) / 864e5 / 7) + 1; if (dom && sem === 4) t.cor = 'rosa'; }
  else if (d >= P && d <= pent) { t.tempo = 'Tempo Pascal'; t.cor = 'branco'; }
  var mov = {}; mov[isoDe(P)] = ['Domingo da Páscoa', 'branco']; mov[isoDe(cinzas)] = ['Quarta-feira de Cinzas', 'roxo']; mov[isoDe(mais(P, -7))] = ['Domingo de Ramos', 'vermelho']; mov[isoDe(mais(P, -2))] = ['Sexta-feira da Paixão', 'vermelho']; mov[isoDe(pent)] = ['Pentecostes', 'vermelho']; mov[isoDe(mais(P, 56))] = ['Santíssima Trindade', 'branco']; mov[isoDe(mais(P, 60))] = ['Corpus Christi', 'branco']; mov[isoDe(mais(adv, -7))] = ['Cristo Rei', 'branco'];
  var f = mov[ds] || ((!dom || ['11-01', '11-02', '12-08', '06-29', '08-15'].indexOf(ds.slice(5)) >= 0) && t.tempo !== 'Semana Santa' ? FESTAS[ds.slice(5)] : null);
  if (f) { t.festa = f[0]; t.cor = f[1]; }
  return t;
}

/* ---------- Estado ---------- */
var S = { senha: '', clinicas: [], slug: lembrar('snt_clinica'), vista: 'geral', dados: {}, busca: '', filtro: 'todas', vigilia: Math.floor(Math.random() * VIGILIAS.length), leadAberto: null, origensExtras: {} };
var raiz = document.getElementById('raiz'), camada = document.getElementById('camada');

function aplicarTema() {
  var pref = lembrar('snt_tema') || 'auto';
  var escuro = pref === 'dark' || (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', escuro ? 'dark' : 'light');
  document.documentElement.setAttribute('data-lit', liturgia(new Date()).cor);
}
function alternarTema() {
  var escuro = document.documentElement.getAttribute('data-theme') === 'dark';
  guardar('snt_tema', escuro ? 'light' : 'dark');
  aplicarTema();
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aplicarTema);

function api(caminho, opcoes) {
  opcoes = opcoes || {};
  return fetch('/admin/api' + caminho, {
    method: opcoes.method || 'GET',
    headers: { Authorization: 'Bearer ' + S.senha, 'Content-Type': 'application/json' },
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined
  }).then(function (r) {
    return r.json().catch(function () { return {}; }).then(function (d) {
      if (!r.ok) { var e = new Error(d.erro || 'Erro ' + r.status); e.status = r.status; throw e; }
      return d;
    });
  });
}
function aviso(texto) {
  var t = h('div', { class: 'toast', role: 'status', text: texto });
  camada.appendChild(t);
  setTimeout(function () { t.remove(); }, 2200);
}
function clinicaAtual() {
  return S.clinicas.filter(function (c) { return c.slug === S.slug; })[0] || S.clinicas[0] || null;
}

/* ---------- Entrada ---------- */
function telaEntrada(erro) {
  var campo = h('input', { class: 'campo', type: 'password', id: 'senha', autocomplete: 'current-password', required: true });
  var msg = h('p', { class: 'erro', role: 'alert', text: erro || '' });
  raiz.replaceChildren(h('div', { class: 'entrada' },
    h('form', { class: 'ent-centro', onsubmit: function (ev) { ev.preventDefault(); entrar(campo.value); } },
      h('div', { class: 'ent-arte', svg: ISO_TORRE }),
      h('h1', { class: 'ent-marca', text: 'Sentinela' }),
      h('p', { class: 'ent-sub', text: 'A jornada de cada lead, do primeiro toque à agenda.' }),
      h('div', { class: 'ent-forma' },
        h('label', { for: 'senha' }, 'Senha', campo),
        msg,
        h('button', { class: 'btn btn-escuro', type: 'submit', text: 'Entrar' })),
      h('p', { class: 'ent-cit' }, h('em', { text: 'Vigilate et orate.' }), ' Vigiai e orai.'))));
  campo.focus();
}
function entrar(senha) {
  S.senha = senha;
  return carregarClinicas().then(function () {
    guardarSessao(senha);
    irPara(S.vista);
  }).catch(function (e) {
    S.senha = ''; guardarSessao('');
    telaEntrada(e.status === 401 ? 'Senha incorreta.' : e.message);
  });
}
function sair() { S.senha = ''; guardarSessao(''); telaEntrada(); }

/* ---------- Dados ---------- */
function carregarClinicas() {
  return api('/clinicas').then(function (d) {
    S.clinicas = d.clinicas;
    if (!clinicaAtual() || clinicaAtual().slug !== S.slug) S.slug = S.clinicas[0] ? S.clinicas[0].slug : '';
  });
}
function carregarVista() {
  var slug = S.slug, q = encodeURIComponent(slug);
  if (S.vista === 'geral') return api('/serie?dias=14').then(function (d) { S.dados = { serie: d.serie }; });
  if (!slug) { S.dados = {}; return Promise.resolve(); }
  if (S.vista === 'jornada') return api('/clinicas/' + q + '/leads').then(function (d) { S.dados = { leads: d.leads }; });
  if (S.vista === 'links') return api('/clinicas/' + q + '/links').then(function (d) { S.dados = { links: d.links }; });
  if (S.vista === 'cliques') return Promise.all([api('/serie?dias=14&clinica=' + q), api('/cliques?limite=100&clinica=' + q)]).then(function (r) { S.dados = { serie: r[0].serie, cliques: r[1].cliques }; });
  S.dados = {};
  return Promise.resolve();
}
function irPara(vista) {
  S.vista = vista;
  return carregarVista().then(render).catch(function (e) {
    if (e.status === 401) return sair();
    aviso(e.message);
  });
}
function recarregar() { return carregarClinicas().then(function () { return irPara(S.vista); }); }

/* ---------- Casca ---------- */
function render() {
  var c = clinicaAtual();
  var item = function (id, rotulo, qtd) {
    return h('button', { type: 'button', 'aria-current': S.vista === id ? 'true' : null, onclick: function () { irPara(id); } },
      h('span', { svg: icone(id), style: 'display:contents' }), rotulo, qtd !== undefined ? h('span', { class: 'qtd', text: qtd }) : null);
  };
  var seletor = h('select', { class: 'seletor', 'aria-label': 'Clínica', onchange: function (ev) { S.slug = ev.target.value; guardar('snt_clinica', S.slug); S.leadAberto = null; irPara(S.vista === 'geral' ? 'jornada' : S.vista); } },
    S.clinicas.map(function (k) { return h('option', { value: k.slug, text: k.nome, selected: k.slug === S.slug }); }));
  var lt = liturgia(new Date());
  var vistas = { geral: vistaGeral, jornada: vistaJornada, links: vistaLinks, cliques: vistaCliques, ajustes: vistaAjustes };

  raiz.replaceChildren(h('div', { class: 'app' },
    h('aside', { class: 'lateral' },
      h('div', { class: 'marca' }, h('span', { svg: ISO_MARCA }),
        h('div', {}, h('div', { class: 'marca-nome', text: 'Sentinela' }), h('div', { class: 'marca-sub', text: 'Ora et Labora · vigília' }))),
      h('nav', { class: 'nav', 'aria-label': 'Seções' }, item('geral', 'Visão geral', S.clinicas.length)),
      c ? [h('p', { class: 'nav-rotulo', text: 'Clínica' }), seletor,
        h('nav', { class: 'nav', 'aria-label': 'Clínica' }, item('jornada', 'Jornada do lead'), item('links', 'Links rastreáveis'), item('cliques', 'Cliques'), item('ajustes', 'Ajustes'))] : null,
      h('div', { class: 'lateral-pe' },
        h('p', {}, h('em', { text: 'Santos Anjos da Guarda,' }), ' rogai por nós.'),
        h('nav', { class: 'nav' },
          h('button', { type: 'button', onclick: alternarTema }, h('span', { svg: icone('tema'), style: 'display:contents' }), 'Tema'),
          h('button', { type: 'button', onclick: sair }, h('span', { svg: icone('sair'), style: 'display:contents' }), 'Sair')))),
    h('main', { class: 'principal' },
      h('div', { class: 'topo' },
        h('p', { class: 'lit' }, h('i'), (lt.festa ? lt.festa + ' · ' : '') + lt.tempo),
        h('div', { class: 'topo-dir' },
          h('span', { class: 'data-hoje', text: new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) }),
          h('button', { class: 'btn btn-escuro', type: 'button', onclick: function () { folhaClinica(); } }, h('span', { svg: icone('mais'), style: 'display:contents' }), 'Nova clínica'))),
      S.clinicas.length === 0 && S.vista !== 'geral' ? vistaGeral() : vistas[S.vista]())));
}
function cabecalho(rotulo, titulo, destaque, texto, extra) {
  return h('div', { class: 'cab' },
    rotulo ? h('p', { class: 'nota', text: rotulo }) : null,
    h('h1', { class: 'saudacao' }, titulo, destaque ? [' ', h('em', { text: destaque })] : null),
    texto || extra ? h('p', { class: 'sub' }, texto, extra) : null);
}
function numero(rotulo, valor, legenda) {
  return h('div', { class: 'num' }, h('small', { text: rotulo }), h('b', { text: valor }), legenda ? h('span', { text: legenda }) : null);
}

/* ---------- Gráfico: cliques por dia ---------- */
function diasDaSerie(serie, n) {
  var hoje = new Date(), mapa = {}, lista = [], i, d;
  serie.forEach(function (s) { mapa[s.dia] = (mapa[s.dia] || 0) + s.cliques; });
  for (i = n - 1; i >= 0; i -= 1) { d = mais(hoje, -i); lista.push({ dia: isoDe(d), data: d, cliques: mapa[isoDe(d)] || 0 }); }
  return lista;
}
function grafico(dias) {
  var L = 640, A = 190, esq = 30, baixo = 24, topo = 12, area = A - topo - baixo, passo = (L - esq) / dias.length, larg = Math.max(6, Math.min(passo - 2, 26));
  var max = Math.max.apply(null, dias.map(function (d) { return d.cliques; }).concat([4]));
  var teto = Math.ceil(max / 4) * 4;
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'graf'); svg.setAttribute('viewBox', '0 0 ' + L + ' ' + A); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Cliques por dia nos últimos ' + dias.length + ' dias');
  var caixa = h('div', { class: 'graf-caixa' }), dica = h('div', { class: 'dica', hidden: true });
  function el(nome, attrs, texto) { var e = document.createElementNS(ns, nome), k; for (k in attrs) e.setAttribute(k, attrs[k]); if (texto !== undefined) e.textContent = texto; svg.appendChild(e); return e; }
  [0, 0.5, 1].forEach(function (f) {
    var y = topo + area * (1 - f);
    el('line', { class: 'eixo', x1: esq, x2: L, y1: y, y2: y });
    el('text', { class: 'rot-g', x: esq - 6, y: y + 4, 'text-anchor': 'end' }, String(Math.round(teto * f)));
  });
  dias.forEach(function (d, i) {
    var x = esq + i * passo + (passo - larg) / 2, alt = d.cliques ? Math.max(3, area * d.cliques / teto) : 2, y = topo + area - alt, r = Math.min(4, alt);
    var rotulo = d.data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) + ': ' + plural(d.cliques, 'clique', 'cliques');
    var alvo = el('rect', { class: 'alvo', x: esq + i * passo, y: topo, width: passo, height: area, tabindex: 0, 'aria-label': rotulo });
    el('path', { class: 'barra-g' + (d.cliques ? '' : ' zero'), d: 'M' + x + ',' + (y + alt) + ' V' + (y + r) + ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y + ' H' + (x + larg - r) + ' Q' + (x + larg) + ',' + y + ' ' + (x + larg) + ',' + (y + r) + ' V' + (y + alt) + ' Z' });
    if (i % 2 === (dias.length - 1) % 2) el('text', { class: 'rot-g', x: x + larg / 2, y: A - 6, 'text-anchor': 'middle' }, diaMes(d.data));
    function mostrar() {
      dica.replaceChildren(h('b', { text: String(d.cliques) }), ' ' + (d.cliques === 1 ? 'clique' : 'cliques') + ' · ' + d.data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }));
      dica.style.left = ((x + larg / 2) / L * 100) + '%'; dica.style.top = ((y - 6) / A * 100) + '%'; dica.hidden = false;
    }
    alvo.addEventListener('pointerenter', mostrar); alvo.addEventListener('focus', mostrar);
    alvo.addEventListener('pointerleave', function () { dica.hidden = true; }); alvo.addEventListener('blur', function () { dica.hidden = true; });
  });
  caixa.appendChild(svg); caixa.appendChild(dica);
  var tabela = h('details', { class: 'tabela-g' }, h('summary', { text: 'Ver em tabela' }),
    h('div', { class: 'rolo' }, h('table', { class: 'tab' },
      h('thead', {}, h('tr', {}, h('th', { text: 'Dia' }), h('th', { class: 'n', text: 'Cliques' }))),
      h('tbody', {}, dias.slice().reverse().map(function (d) { return h('tr', {}, h('td', { text: d.data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }) }), h('td', { class: 'n', text: d.cliques })); })))));
  return h('div', { class: 'painel pad', style: 'display:grid;gap:12px' }, caixa, tabela);
}

/* ---------- Visão geral ---------- */
function vistaGeral() {
  var hr = new Date().getHours(), saud = hr < 12 ? 'Bom dia,' : hr < 18 ? 'Boa tarde,' : 'Boa noite,';
  var v = VIGILIAS[S.vigilia % VIGILIAS.length], ativas = S.clinicas.filter(function (c) { return c.ativa; }).length;
  var soma = function (campo) { return S.clinicas.reduce(function (t, c) { return t + (c[campo] || 0); }, 0); };
  var dias = diasDaSerie(S.dados.serie || [], 14);

  var tabela = S.clinicas.length === 0
    ? h('p', { class: 'vazio' }, h('em', { text: 'Nenhuma clínica sob vigia ainda.' }), ' Cadastre a primeira no botão "Nova clínica".')
    : h('div', { class: 'rolo' }, h('table', { class: 'tab' },
      h('thead', {}, h('tr', {}, h('th', { text: 'Clínica' }), h('th', { class: 'n', text: 'Cliques · 7 dias' }), h('th', { class: 'n', text: 'Conversas' }), h('th', { class: 'n', text: 'Leads' }), h('th', { class: 'n', text: 'Agendaram' }), h('th', { class: 'n', text: 'Fecharam' }))),
      h('tbody', {}, S.clinicas.map(function (c) {
        return h('tr', { class: 'clica', tabindex: 0, onclick: function () { S.slug = c.slug; guardar('snt_clinica', c.slug); S.leadAberto = null; irPara('jornada'); }, onkeydown: function (ev) { if (ev.key === 'Enter') ev.currentTarget.click(); } },
          h('td', {}, h('b', { text: c.nome }), c.ativa ? null : [' ', h('span', { class: 'pill', text: 'Desativada' })], h('small', { text: 'WhatsApp ' + c.whatsapp })),
          h('td', { class: 'n', text: c.cliques_7_dias }), h('td', { class: 'n', text: c.conversas_7_dias }), h('td', { class: 'n', text: c.leads }),
          h('td', { class: 'n', text: c.agendaram }), h('td', { class: 'n', text: c.fecharam }));
      }))));

  return h('div', { class: 'pagina' },
    cabecalho('', saud, 'Richar', plural(ativas, 'clínica sob vigia', 'clínicas sob vigia')),
    h('div', { class: 'duas' },
      h('div', { class: 'coluna' },
        h('section', { class: 'banner', 'aria-label': 'Vigília do dia' },
          h('div', { class: 'banner-texto' },
            h('blockquote', { text: v[0] }), h('p', { class: 'trad', text: v[1] }), h('p', { class: 'autor', text: v[2] }),
            h('button', { class: 'link', type: 'button', text: 'Outra passagem', onclick: function () { S.vigilia += 1; render(); } })),
          h('div', { class: 'banner-arte', svg: ISO_TORRE })),
        h('section', { class: 'secao' },
          h('div', { class: 'secao-topo' }, h('h2', { class: 'rot', text: 'Cliques nos links por dia' }), h('span', { class: 'nota', text: 'Últimos 14 dias · todas as clínicas' })),
          grafico(dias)),
        h('section', { class: 'secao' },
          h('div', { class: 'secao-topo' }, h('h2', { class: 'rot' }, 'Clínicas', h('span', { class: 'n', text: S.clinicas.length }))),
          h('div', { class: 'painel' }, tabela),
          h('p', { class: 'nota', text: 'Conversas, leads, agenda e fechamento começam a contar quando o WhatsApp da clínica for conectado.' }))),
      h('aside', { class: 'lado', 'aria-label': 'Resumo' },
        h('div', { class: 'numeros' },
          numero('Últimos 7 dias', String(soma('cliques_7_dias')), 'cliques nos links'),
          numero('Conversas', String(soma('conversas_7_dias')), 'ligadas a um clique'),
          numero('Leads', String(soma('leads')), 'com jornada registrada'),
          numero('Agendaram', String(soma('agendaram')), plural(soma('fecharam'), 'fechou', 'fecharam'))),
        h('div', { class: 'torre' },
          h('div', { class: 'torre-topo' }, h('p', { class: 'torre-tit' }, 'A ', h('em', { text: 'torre' })), h('span', { class: 'torre-n', text: ativas + ' de ' + S.clinicas.length + ' ativas' })),
          h('div', { class: 'torre-arte', svg: ISO_TORRE })))));
}

/* ---------- Jornada ---------- */
function exemplos() {
  var hoje = new Date();
  function em(dias, hh, mm) { var d = mais(hoje, -dias); d.setHours(hh, mm, 0, 0); return d.toISOString(); }
  function t(tipo, canal, dias, hh, mm, titulo, ctipo, detalhes) { return { tipo: tipo, canal: canal, quando: em(dias, hh, mm), titulo: titulo || null, conteudo_tipo: ctipo || null, detalhes: detalhes || {} }; }
  return [
    { id: 'ex1', nome: 'Camila R.', telefone: '(51) 9••••-1203', ig_username: 'camila.r', segue_perfil: true,
      toques: [
        t('comentario', 'instagram', 23, 20, 14, 'Reel: antes e depois de preenchimento labial', 'antes_depois', { texto: 'Que resultado lindo! Dói muito?' }),
        t('resposta_story', 'instagram', 16, 12, 40, 'Story: bastidores do consultório', 'bastidor', { texto: 'Atende aos sábados?' }),
        t('clique_anuncio_whatsapp', 'whatsapp', 9, 21, 5, 'Anúncio: avaliação de harmonização', 'oferta'),
        t('clique_link', 'link', 2, 19, 32, null, null, { origem: 'bio' }),
        t('primeira_mensagem', 'whatsapp', 2, 19, 33, null, null, { texto: 'Olá! Vim pelo Instagram e quero agendar uma avaliação.' }),
        t('declarado', 'whatsapp', 2, 19, 51, null, null, { texto: 'Acompanho a doutora faz uns dois meses. Vi vários antes e depois de boca e o vídeo da paciente contando como foi.' })],
      etapas: [{ etapa: 'agendou', quando: em(2, 20, 2) }, { etapa: 'fechou', valor: 2800, quando: em(0, 10, 30) }] },
    { id: 'ex2', nome: 'Juliana M.', telefone: '(51) 9••••-7046', ig_username: 'ju.mendes', segue_perfil: false,
      toques: [
        t('clique_anuncio_whatsapp', 'whatsapp', 4, 13, 12, 'Anúncio: depoimento de paciente', 'depoimento'),
        t('primeira_mensagem', 'whatsapp', 4, 13, 13, null, null, { texto: 'Oi, vi o anúncio. Quanto custa a avaliação?' }),
        t('declarado', 'whatsapp', 4, 13, 40, null, null, { texto: 'Foi a primeira vez que vi, apareceu o vídeo e chamei.' })],
      etapas: [{ etapa: 'agendou', quando: em(3, 9, 15) }] },
    { id: 'ex3', nome: 'Patrícia S.', telefone: '(51) 9••••-3381', ig_username: 'patisouza', segue_perfil: true,
      toques: [
        t('post_compartilhado', 'instagram', 31, 22, 3, 'Reel: como funciona o bioestimulador', 'procedimento', { texto: 'Faz esse procedimento?' }),
        t('comentario', 'instagram', 20, 8, 47, 'Post: depoimento de paciente', 'depoimento', { texto: 'Quero muito!' }),
        t('clique_anuncio_direct', 'instagram', 12, 18, 20, 'Anúncio: antes e depois de papada', 'antes_depois'),
        t('clique_link', 'link', 6, 7, 58, null, null, { origem: 'stories' }),
        t('primeira_mensagem', 'whatsapp', 6, 7, 59, null, null, { texto: 'Bom dia! Vim pelo Instagram e quero agendar uma avaliação.' })],
      etapas: [] },
    { id: 'ex4', nome: 'Fernanda L.', telefone: '(51) 9••••-5530', ig_username: null, segue_perfil: null,
      toques: [
        t('clique_link', 'link', 1, 16, 9, null, null, { origem: 'bio' }),
        t('primeira_mensagem', 'whatsapp', 1, 16, 10, null, null, { texto: 'Olá! Vim pelo Instagram e quero agendar uma avaliação.' })],
      etapas: [] },
    { id: 'ex5', nome: 'Renata A.', telefone: '(51) 9••••-0917', ig_username: 'renata.alves', segue_perfil: true,
      toques: [
        t('comentario', 'instagram', 14, 21, 30, 'Post: depoimento de paciente', 'depoimento', { texto: 'Ficou muito natural.' }),
        t('resposta_story', 'instagram', 8, 13, 5, 'Story: antes e depois de olheiras', 'antes_depois', { texto: 'Qual o valor da avaliação?' }),
        t('clique_link', 'link', 5, 20, 41, null, null, { origem: 'stories' }),
        t('primeira_mensagem', 'whatsapp', 5, 20, 42, null, null, { texto: 'Olá! Vim pelo Instagram e quero agendar uma avaliação.' }),
        t('declarado', 'whatsapp', 5, 21, 3, null, null, { texto: 'Vi os depoimentos e os stories de antes e depois.' })],
      etapas: [{ etapa: 'agendou', quando: em(4, 11, 20) }] },
    { id: 'ex6', nome: 'Bruna T.', telefone: '(51) 9••••-3392', ig_username: null, segue_perfil: false,
      toques: [
        t('clique_anuncio_whatsapp', 'whatsapp', 3, 22, 48, 'Anúncio: avaliação de harmonização', 'oferta'),
        t('primeira_mensagem', 'whatsapp', 3, 22, 49, null, null, { texto: 'Quanto custa?' })],
      etapas: [] }
  ];
}
function resumoDoLead(l) {
  var feitos = l.toques.filter(function (t) { return t.tipo !== 'declarado'; });
  var ditos = l.toques.filter(function (t) { return t.tipo === 'declarado' && t.detalhes && t.detalhes.texto; });
  var agenda = l.etapas.filter(function (e) { return e.etapa === 'agendou'; })[0];
  var fechou = l.etapas.filter(function (e) { return e.etapa === 'fechou'; })[0];
  var antes = agenda ? feitos.filter(function (t) { return new Date(t.quando) <= new Date(agenda.quando); }) : feitos;
  var dias = agenda && feitos.length ? Math.max(0, Math.round((new Date(agenda.quando) - new Date(feitos[0].quando)) / 864e5)) : null;
  return { feitos: feitos, ditos: ditos, agenda: agenda, fechou: fechou, antes: antes.length, dias: dias, situacao: fechou ? 'fechou' : agenda ? 'agendou' : 'conversa' };
}
var SITUACOES = { fechou: ['Fechou', 'pill ok'], agendou: ['Agendou', 'pill ok'], conversa: ['Em conversa', 'pill'] };
function pilula(r) { return h('span', { class: SITUACOES[r.situacao][1], text: SITUACOES[r.situacao][0] }); }
function mediana(valores) {
  var v = valores.slice().sort(function (a, b) { return a - b; }), m = Math.floor(v.length / 2);
  return v.length ? (v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2) : null;
}
function tituloDoToque(t) {
  var d = t.detalhes || {};
  return t.tipo === 'clique_link' && d.origem ? 'Clicou no link (' + d.origem + ')' : (TOQUES[t.tipo] || [t.tipo])[0];
}
function eventosDoLead(l, r) {
  return r.feitos.map(function (t) { return { quando: t.quando, toque: t }; })
    .concat(l.etapas.map(function (e) { return { quando: e.quando, etapa: e }; }))
    .sort(function (a, b) { return new Date(a.quando) - new Date(b.quando); });
}
// A jornada inteira em uma fileira de ícones, para comparar várias leads de relance.
function trilha(l, r) {
  var itens = eventosDoLead(l, r).map(function (it) {
    return it.etapa ? { quando: it.quando, etapa: true, rot: ETAPAS[it.etapa.etapa] || it.etapa.etapa }
      : { quando: it.quando, ic: (TOQUES[it.toque.tipo] || [0, 'mensagem'])[1], rot: tituloDoToque(it.toque) + (it.toque.titulo ? ': ' + it.toque.titulo : '') };
  });
  var max = 10, corte = itens.length > max ? itens.slice(itens.length - max) : itens;
  return h('span', { class: 'trilha', role: 'img', 'aria-label': itens.map(function (i) { return i.rot; }).join(', depois ') },
    itens.length > max ? h('span', { class: 'trilha-mais', text: '+' + (itens.length - max) }) : null,
    corte.map(function (i) { return h('span', { class: 'trilha-i' + (i.etapa ? ' etapa' : ''), title: diaMes(i.quando) + ' · ' + i.rot, svg: icone(i.etapa ? 'marco' : i.ic) }); }));
}
// Em quantas jornadas cada coisa aparece: quem agendou ao lado de quem não agendou.
function comparacao(titulo, A, B, chave, rotulo) {
  function conta(grupo) {
    var c = {};
    grupo.forEach(function (l) { var v = {}; l.toques.forEach(function (t) { var k = chave(t); if (k) v[k] = 1; }); Object.keys(v).forEach(function (k) { c[k] = (c[k] || 0) + 1; }); });
    return c;
  }
  var ca = conta(A), cb = conta(B), parte = function (c, k, g) { return g.length ? (c[k] || 0) / g.length : 0; };
  var chaves = Object.keys(ca).concat(Object.keys(cb)).filter(function (k, i, a) { return a.indexOf(k) === i; })
    .sort(function (x, y) { return parte(ca, y, A) - parte(ca, x, A) || parte(cb, y, B) - parte(cb, x, B); });
  var linha = function (cls, n, grupo) {
    var pct = grupo.length ? Math.round(n / grupo.length * 100) : 0;
    return h('div', { class: 'comp-l' }, h('div', { class: 'barra ' + cls }, h('i', { style: 'width:' + pct + '%' })), h('small', { text: grupo.length ? n + ' de ' + grupo.length + ' · ' + pct + '%' : 'sem leads' }));
  };
  return h('div', { class: 'painel pad', style: 'display:grid;gap:14px;align-content:start' },
    h('p', { class: 'rot', text: titulo }),
    chaves.length === 0 ? h('p', { class: 'nota', text: 'Sem dados ainda.' })
      : h('div', { class: 'comps' }, chaves.map(function (k) { return h('div', { class: 'comp' }, h('span', { class: 'comp-rot', text: rotulo(k) }), linha('a', ca[k] || 0, A), linha('b', cb[k] || 0, B)); })));
}
function vistaJornada() {
  var c = clinicaAtual();
  var reais_ = S.dados.leads || [], exemplo = reais_.length === 0, leads = exemplo ? exemplos() : reais_;
  var resumos = leads.map(resumoDoLead), A = [], B = [], rA = [];
  leads.forEach(function (l, i) { if (resumos[i].agenda) { A.push(l); rA.push(resumos[i]); } else B.push(l); });
  var seguem = function (g) { return g.filter(function (l) { return l.segue_perfil; }).length; };
  var conta = { todas: leads.length, fechou: 0, agendou: 0, conversa: 0 };
  resumos.forEach(function (r) { conta[r.situacao] += 1; });
  var aberto = leads.filter(function (l) { return String(l.id) === String(S.leadAberto); })[0] || leads[0];

  var lista = h('div', { class: 'painel leads' }), chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Situação' });
  var ficha = h('div', { class: 'painel', id: 'ficha' }, fichaDoLead(aberto, resumoDoLead(aberto)));
  function abrir(l, botao) {
    S.leadAberto = l.id;
    ficha.replaceChildren(fichaDoLead(l, resumoDoLead(l)));
    Array.prototype.forEach.call(lista.children, function (b) { b.removeAttribute('aria-current'); });
    botao.setAttribute('aria-current', 'true');
    if (window.matchMedia('(max-width:980px)').matches) ficha.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function preencher() {
    var busca = S.busca.trim().toLowerCase().replace(/^@/, '');
    chips.replaceChildren.apply(chips, [['todas', 'Todas'], ['fechou', 'Fechou'], ['agendou', 'Agendou'], ['conversa', 'Em conversa']].map(function (f) {
      return h('button', { class: 'chip', type: 'button', 'aria-pressed': S.filtro === f[0] ? 'true' : 'false', onclick: function () { S.filtro = f[0]; preencher(); } }, f[1], h('small', { text: conta[f[0]] }));
    }));
    var linhas = [];
    leads.forEach(function (l, i) {
      var r = resumos[i];
      if (S.filtro !== 'todas' && r.situacao !== S.filtro) return;
      if (busca && [l.nome, l.telefone, l.ig_username].join(' ').toLowerCase().replace(/[^a-z0-9à-ú@. ]/g, '').indexOf(busca) < 0
        && String(l.telefone || '').replace(/\D/g, '').indexOf(busca.replace(/\D/g, '') || '#') < 0) return;
      var botao = h('button', { class: 'lead', type: 'button', 'aria-current': l === aberto || String(l.id) === String(S.leadAberto) ? 'true' : null, onclick: function () { abrir(l, botao); } },
        h('span', { class: 'lead-topo' }, h('b', { text: l.nome || l.telefone || '@' + l.ig_username }), pilula(r)),
        trilha(l, r),
        h('span', { class: 'lead-meta', text: plural(r.feitos.length, 'interação', 'interações') + (r.dias !== null ? ' · ' + plural(r.dias, 'dia', 'dias') + ' até agendar' : '') }));
      linhas.push(botao);
    });
    lista.replaceChildren.apply(lista, linhas.length ? linhas : [h('p', { class: 'vazio', text: 'Nenhuma lead com esse filtro.' })]);
  }
  preencher();

  var basePequena = A.length < 10 || B.length < 10;
  return h('div', { class: 'pagina' },
    cabecalho(c.nome, 'Jornada', 'do lead', 'O que as leads fazem e dizem ter visto antes de fechar a agenda.', exemplo ? h('span', { class: 'pill aviso', text: 'Dados de exemplo' }) : null),
    exemplo ? h('div', { class: 'faixa' }, h('b', { text: 'Ainda não há leads desta clínica.' }), 'As fichas abaixo são um exemplo de como a jornada vai aparecer quando o WhatsApp e o Instagram forem conectados.') : null,

    h('section', { class: 'secao' },
      h('div', { class: 'secao-topo' },
        h('h2', { class: 'rot', text: 'O que diferencia quem agendou' }),
        h('div', { class: 'legenda' }, h('span', {}, h('i', { class: 'a' }), 'Agendaram (' + A.length + ')'), h('span', {}, h('i', { class: 'b' }), 'Não agendaram (' + B.length + ')'))),
      h('div', { class: 'resumo' },
        numero('Interações até a agenda', A.length ? decimal(mediana(rA.map(function (r) { return r.antes; }))) : '—', 'mediana de ' + plural(A.length, 'lead que agendou', 'leads que agendaram')),
        numero('Dias até a agenda', A.length ? decimal(mediana(rA.map(function (r) { return r.dias || 0; }))) : '—', 'da primeira interação ao agendamento'),
        numero('Seguem o perfil', A.length ? seguem(A) + ' de ' + A.length : '—', 'de quem agendou · ' + seguem(B) + ' de ' + B.length + ' de quem não agendou'),
        numero('Leads', String(leads.length), plural(A.length, 'agendou', 'agendaram') + ' · ' + plural(conta.fechou, 'fechou', 'fecharam'))),
      h('div', { class: 'resumo', style: 'grid-template-columns:repeat(auto-fit,minmax(300px,1fr))' },
        comparacao('Tipo de conteúdo na jornada', A, B, function (t) { return t.conteudo_tipo; }, function (k) { return TIPOS[k] || k; }),
        comparacao('Tipo de interação na jornada', A, B, function (t) { return t.tipo === 'declarado' || t.tipo === 'primeira_mensagem' ? null : t.tipo; }, function (k) { return (TOQUES[k] || [k])[0]; })),
      h('p', { class: 'nota', text: (basePequena ? 'Base pequena: leia como indício, não como regra. ' : '') + 'A comparação mostra o que aparece mais em quem agendou. Para saber se um conteúdo causa o agendamento, é preciso testar com e sem ele.' })),

    h('section', { class: 'secao' },
      h('div', { class: 'secao-topo' }, h('h2', { class: 'rot' }, 'Leads', h('span', { class: 'n', text: leads.length }))),
      h('div', { class: 'ferr' },
        h('input', { class: 'campo', type: 'search', placeholder: 'Buscar por nome, telefone ou @', 'aria-label': 'Buscar lead', value: S.busca, oninput: function (ev) { S.busca = ev.target.value; preencher(); } }),
        chips),
      h('div', { class: 'jornada' }, lista, ficha)));
}
function fichaDoLead(l, r) {
  var itens = eventosDoLead(l, r), anterior = null, linhas = [];
  var meiaNoite = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  itens.forEach(function (it) {
    var d = new Date(it.quando), dia = meiaNoite(d), novoDia = !anterior || dia.getTime() !== anterior.getTime();
    if (anterior && novoDia) {
      var n = Math.round((dia - anterior) / 864e5);
      linhas.push(h('li', { class: 'toque pausa' }, h('div'), h('div', { class: 'toque-marca' }), h('div', { class: 'toque-corpo' }, h('span', { text: n === 1 ? 'No dia seguinte' : n + ' dias depois' }))));
    }
    anterior = dia;
    var quando = h('div', { class: 'toque-quando' }, novoDia ? h('b', { text: diaMes(it.quando) }) : null, hora(it.quando));
    if (it.etapa) {
      linhas.push(h('li', { class: 'toque etapa' }, quando, h('div', { class: 'toque-marca', svg: icone('marco') }),
        h('div', { class: 'toque-corpo' }, h('b', { text: ETAPAS[it.etapa.etapa] || it.etapa.etapa }), it.etapa.valor ? h('span', { text: reais(it.etapa.valor) }) : null)));
      return;
    }
    var t = it.toque, dt = t.detalhes || {};
    linhas.push(h('li', { class: 'toque' }, quando, h('div', { class: 'toque-marca', svg: icone((TOQUES[t.tipo] || [0, 'mensagem'])[1]) }),
      h('div', { class: 'toque-corpo' },
        h('b', { text: tituloDoToque(t) }),
        t.titulo ? h('span', { text: t.titulo }) : null,
        dt.texto ? h('span', { text: '"' + dt.texto + '"' }) : null,
        t.conteudo_tipo ? h('div', { class: 'toque-tags' }, h('span', { class: 'pill', text: TIPOS[t.conteudo_tipo] || t.conteudo_tipo })) : null)));
  });
  var frase = r.agenda
    ? [h('b', { text: plural(r.antes, 'interação', 'interações') }), ' em ', h('b', { text: plural(r.dias, 'dia', 'dias') }), ' até agendar', r.fechou ? [' · fechou', r.fechou.valor ? [' ', h('b', { text: reais(r.fechou.valor) })] : null] : null, '.']
    : [h('b', { text: plural(r.feitos.length, 'interação', 'interações') }), ' até agora, ainda sem agenda.'];
  return h('div', { class: 'ficha' },
    h('div', { class: 'ficha-topo' },
      h('div', { style: 'display:grid;gap:4px' },
        h('h3', { text: l.nome || 'Lead sem nome' }),
        h('div', { class: 'ficha-meta' },
          l.telefone ? h('span', { text: l.telefone }) : null,
          l.ig_username ? h('span', { text: '@' + l.ig_username }) : h('span', { text: 'Instagram não identificado' }),
          l.segue_perfil === null || l.segue_perfil === undefined ? null : h('span', { text: l.segue_perfil ? 'Segue o perfil' : 'Não segue o perfil' }))),
      pilula(r)),
    h('p', { class: 'frase' }, frase),
    r.ditos.length
      ? h('div', { class: 'dito-caixa' },
        h('p', { class: 'dito-tit' }, h('span', { svg: icone('fala'), style: 'display:contents' }), 'O que ela disse ter visto'),
        r.ditos.map(function (t) { return h('blockquote', {}, '"' + t.detalhes.texto + '"', h('small', { text: 'Dito em ' + diaMes(t.quando) })); }))
      : h('p', { class: 'nota', text: 'Ainda sem registro do que ela disse ter visto.' }),
    h('ol', { class: 'tempo' }, linhas),
    h('p', { class: 'nota', text: 'Agenda e fechamento serão marcados nesta ficha quando o WhatsApp for conectado.' }));
}

/* ---------- Links ---------- */
function vistaLinks() {
  var c = clinicaAtual(), porOrigem = {}, extras = S.origensExtras[c.slug] || [];
  (S.dados.links || []).forEach(function (l) { porOrigem[l.origem] = l; });
  var origens = ORIGENS_PADRAO.concat(extras).concat(Object.keys(porOrigem)).filter(function (o, i, a) { return a.indexOf(o) === i; });
  var nova = h('input', { class: 'campo', placeholder: 'Ex.: google, site, cartao', pattern: '[a-z0-9][a-z0-9\\-]{0,31}', 'aria-label': 'Nome do ponto de contato' });

  return h('div', { class: 'pagina' },
    cabecalho(c.nome, 'Links', 'rastreáveis', 'Um link para cada ponto de contato. Nos anúncios de clique para WhatsApp não precisa de link: a Meta informará qual anúncio trouxe a pessoa.'),
    h('section', { class: 'secao' }, h('h2', { class: 'rot', text: 'Como o rastreio funciona' }),
      h('ol', { class: 'passos' }, PASSOS.map(function (p) { return h('li', {}, h('span', { text: p[0] }), h('b', { text: p[1] }), h('span', { text: p[2] })); }))),
    h('section', { class: 'secao' },
      h('div', { class: 'secao-topo' }, h('h2', { class: 'rot' }, 'Links', h('span', { class: 'n', text: origens.length }))),
      h('div', { class: 'painel rolo' }, h('table', { class: 'tab' },
        h('thead', {}, h('tr', {}, h('th', { text: 'Link' }), h('th', { class: 'n', text: 'Cliques · 7 dias' }), h('th', { class: 'n', text: 'Total' }), h('th', { class: 'n', text: 'Conversas' }), h('th', { class: 'n', text: 'Último clique' }), h('th', {}))),
        h('tbody', {}, origens.map(function (o) {
          var l = porOrigem[o] || {}, url = location.origin + '/' + c.slug + '/' + o;
          var botao = h('button', { class: 'btn btn-claro btn-p', type: 'button', text: 'Copiar', onclick: function () { navigator.clipboard.writeText(url).then(function () { botao.textContent = 'Copiado'; setTimeout(function () { botao.textContent = 'Copiar'; }, 1500); }); } });
          return h('tr', {}, h('td', { style: 'min-width:260px' }, h('b', { text: o }), h('small', {}, h('code', { text: url }))),
            h('td', { class: 'n', text: l.cliques_7_dias || 0 }), h('td', { class: 'n', text: l.cliques_total || 0 }), h('td', { class: 'n', text: l.conversas || 0 }),
            h('td', { class: 'n', text: l.ultimo_clique ? dataHora(l.ultimo_clique) : 'Nenhum ainda' }), h('td', { class: 'n' }, botao));
        })))),
      h('form', { class: 'acoes', onsubmit: function (ev) {
        ev.preventDefault();
        var o = nova.value.trim().toLowerCase();
        if (!/^[a-z0-9][a-z0-9-]{0,31}$/.test(o)) return aviso('Use letras minúsculas, números e hífen.');
        S.origensExtras[c.slug] = extras.concat([o]); render();
      } }, h('div', { style: 'flex:0 1 260px' }, nova), h('button', { class: 'btn btn-claro', type: 'submit', text: 'Criar link' }))),
    h('section', { class: 'secao' }, h('h2', { class: 'rot', text: 'Como chega no WhatsApp da clínica' }),
      h('div', { class: 'painel pad', style: 'display:grid;gap:8px' },
        h('div', { style: 'justify-self:start;max-width:90%;padding:9px 12px;border-radius:12px;background:var(--sup);font-size:.92rem' }, c.mensagem.replace(/\s*\{codigo\}/g, ''), ' ', h('span', { style: 'color:var(--tx3)', text: '(ref. B7K2M)' })),
        h('p', { class: 'nota', text: 'O código no fim liga a conversa ao clique. O texto da mensagem pode ser trocado em Ajustes.' }))));
}

/* ---------- Cliques ---------- */
function vistaCliques() {
  var c = clinicaAtual(), lista = S.dados.cliques || [];
  return h('div', { class: 'pagina' },
    cabecalho(c.nome, 'Cliques', 'nos links', 'Cada clique registrado, do mais recente ao mais antigo.'),
    h('section', { class: 'secao' },
      h('div', { class: 'secao-topo' }, h('h2', { class: 'rot', text: 'Cliques por dia' }), h('span', { class: 'nota', text: 'Últimos 14 dias' })),
      grafico(diasDaSerie(S.dados.serie || [], 14))),
    h('section', { class: 'secao' },
      h('div', { class: 'secao-topo' }, h('h2', { class: 'rot' }, 'Cliques recentes', h('span', { class: 'n', text: lista.length })),
        h('button', { class: 'link', type: 'button', text: 'Atualizar', onclick: function () { recarregar(); } })),
      h('div', { class: 'painel' }, lista.length === 0
        ? h('p', { class: 'vazio' }, h('em', { text: 'Nenhum clique ainda.' }), ' Eles aparecem aqui assim que alguém usar um dos links.')
        : h('div', { class: 'rolo' }, h('table', { class: 'tab' },
          h('thead', {}, h('tr', {}, h('th', { text: 'Quando' }), h('th', { text: 'Origem' }), h('th', { text: 'Código' }), h('th', { text: 'Visitante' }), h('th', { text: 'Conversa' }))),
          h('tbody', {}, lista.map(function (q) {
            return h('tr', {}, h('td', { text: dataHora(q.criado_em) }), h('td', { text: q.origem }), h('td', {}, h('code', { text: q.codigo || '' })),
              h('td', { text: q.visitante_id ? q.visitante_id.slice(0, 8) : '' }),
              h('td', {}, q.vinculado ? h('span', { class: 'pill ok', text: 'Ligada' }) : h('span', { class: 'pill', text: 'Aguardando' })));
          })))))));
}

/* ---------- Ajustes e nova clínica ---------- */
function camposClinica(c, comSlug) {
  var f = {
    nome: h('input', { class: 'campo', required: true, maxLength: 120, value: c ? c.nome : '', placeholder: 'Dra. Ana Souza' }),
    slug: comSlug ? h('input', { class: 'campo', required: true, pattern: '[a-z0-9][a-z0-9\\-]{1,48}', placeholder: 'dra-ana' }) : null,
    whatsapp: h('input', { class: 'campo', required: true, inputMode: 'tel', value: c ? c.whatsapp : '', placeholder: '55 51 99999-0000' }),
    mensagem: h('input', { class: 'campo', maxLength: 500, value: c ? c.mensagem : '', placeholder: 'Olá! Vim pelo Instagram e quero agendar uma avaliação.' })
  };
  f.no = h('div', { class: 'campos' },
    h('label', {}, 'Nome', f.nome),
    comSlug ? h('label', {}, 'Endereço no link', f.slug) : null,
    h('label', {}, 'WhatsApp (com 55 e DDD)', f.whatsapp),
    h('label', { class: 'largo' }, 'Mensagem que já vem escrita', f.mensagem));
  return f;
}
function vistaAjustes() {
  var c = clinicaAtual(), f = camposClinica(c, false), erro = h('p', { class: 'erro', role: 'alert' });
  var ativa = h('input', { type: 'checkbox', checked: c.ativa });
  return h('div', { class: 'pagina' },
    cabecalho(c.nome, 'Ajustes', 'da clínica', 'O endereço no link (' + c.slug + ') não muda, porque os links já publicados dependem dele.'),
    h('form', { class: 'painel pad forma', onsubmit: function (ev) {
      ev.preventDefault(); erro.textContent = '';
      api('/clinicas/' + encodeURIComponent(c.slug), { method: 'PATCH', body: { nome: f.nome.value, whatsapp: f.whatsapp.value, mensagem: f.mensagem.value, ativa: ativa.checked } })
        .then(function () { aviso('Ajustes salvos.'); return recarregar(); }).catch(function (e) { erro.textContent = e.message; });
    } }, f.no,
      h('label', { class: 'marcar' }, ativa, 'Clínica ativa (desmarcada, os links param de funcionar)'),
      erro, h('div', { class: 'acoes' }, h('button', { class: 'btn btn-escuro', type: 'submit', text: 'Salvar' }))));
}
function folhaClinica() {
  var f = camposClinica(null, true), erro = h('p', { class: 'erro', role: 'alert' });
  var fechar = function () { camada.replaceChildren(); };
  camada.replaceChildren(h('div', { class: 'veu', onclick: function (ev) { if (ev.target === ev.currentTarget) fechar(); } },
    h('form', { class: 'folha', onsubmit: function (ev) {
      ev.preventDefault(); erro.textContent = '';
      api('/clinicas', { method: 'POST', body: { nome: f.nome.value, slug: f.slug.value, whatsapp: f.whatsapp.value, mensagem: f.mensagem.value } })
        .then(function (d) { fechar(); S.slug = d.clinica.slug; guardar('snt_clinica', S.slug); S.vista = 'links'; aviso('Clínica cadastrada.'); return recarregar(); })
        .catch(function (e) { erro.textContent = e.message; });
    } },
      h('div', { class: 'folha-topo' }, h('h3', {}, 'Nova ', h('em', { text: 'clínica' })), h('button', { class: 'link', type: 'button', text: 'Fechar', onclick: fechar })),
      f.no, erro, h('div', { class: 'acoes' }, h('button', { class: 'btn btn-escuro', type: 'submit', text: 'Cadastrar' })))));
  f.nome.focus();
}

/* ---------- Início ---------- */
aplicarTema();
var anterior = lembrarSessao();
if (anterior) entrar(anterior); else telaEntrada();
})();
