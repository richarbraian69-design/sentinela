-- Fundação do Sentinela: as peças que guardam a jornada de cada lead.

-- Clínica atendida. O slug é o que aparece no link rastreado.
create table clinicas (
  id         bigserial primary key,
  slug       text not null unique,
  nome       text not null,
  whatsapp   text not null,  -- só dígitos, com DDI e DDD (ex.: 5551999990000)
  mensagem   text not null default 'Olá! Vim pelo Instagram e quero agendar uma avaliação.',
  ativa      boolean not null default true,
  criada_em  timestamptz not null default now()
);

-- Uma pessoa. Telefone e perfil do Instagram são as duas chaves que,
-- unidas, fazem a jornada do WhatsApp e a do Instagram virarem uma só ficha.
create table leads (
  id            bigserial primary key,
  clinica_id    bigint not null references clinicas(id),
  nome          text,
  telefone      text,     -- só dígitos, com DDI
  ig_user_id    text,     -- identificador do Instagram
  ig_username   text,     -- o @
  segue_perfil  boolean,  -- null = ainda não sabemos
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (clinica_id, telefone),
  unique (clinica_id, ig_user_id)
);

-- Anúncio, post, reel ou story que pode aparecer na jornada.
create table conteudos (
  id            bigserial primary key,
  clinica_id    bigint not null references clinicas(id),
  origem        text not null check (origem in ('anuncio', 'post', 'reel', 'story')),
  id_externo    text not null,  -- id do anúncio ou da mídia na Meta
  titulo        text,
  miniatura_url text,
  tipo          text,           -- etiqueta: antes_depois, depoimento, procedimento, bastidor, oferta...
  criado_em     timestamptz not null default now(),
  unique (clinica_id, origem, id_externo)
);

-- Clique em um link rastreado (bio, stories, destaque...).
create table cliques (
  id           bigserial primary key,
  clinica_id   bigint not null references clinicas(id),
  origem       text not null,   -- bio, stories, destaque, google...
  codigo       text unique,     -- vai na mensagem pré-preenchida; null quando é robô
  visitante_id text,            -- cookie próprio, liga cliques do mesmo navegador
  navegador    text,
  veio_de      text,
  robo         boolean not null default false,
  lead_id      bigint references leads(id),  -- preenchido quando a mensagem chega
  vinculado_em timestamptz,
  criado_em    timestamptz not null default now()
);
create index cliques_clinica_data on cliques (clinica_id, criado_em desc);
create index cliques_visitante on cliques (visitante_id);

-- Cada toque da lead: a linha do tempo é a lista de toques em ordem.
-- tipos previstos: clique_link, clique_anuncio_whatsapp, clique_anuncio_direct,
-- comentario, resposta_story, post_compartilhado, primeira_mensagem
create table toques (
  id          bigserial primary key,
  clinica_id  bigint not null references clinicas(id),
  lead_id     bigint not null references leads(id),
  tipo        text not null,
  canal       text not null check (canal in ('whatsapp', 'instagram', 'link')),
  conteudo_id bigint references conteudos(id),
  clique_id   bigint references cliques(id),
  detalhes    jsonb not null default '{}'::jsonb,
  ocorrido_em timestamptz not null default now()
);
create index toques_lead_data on toques (lead_id, ocorrido_em);

-- Conversa completa, nos dois sentidos.
create table mensagens (
  id         bigserial primary key,
  clinica_id bigint not null references clinicas(id),
  lead_id    bigint not null references leads(id),
  canal      text not null check (canal in ('whatsapp', 'instagram')),
  direcao    text not null check (direcao in ('entrada', 'saida')),
  texto      text,
  id_externo text unique,  -- id da mensagem na Meta, evita duplicar
  dados      jsonb not null default '{}'::jsonb,
  enviada_em timestamptz not null default now()
);
create index mensagens_lead_data on mensagens (lead_id, enviada_em);

-- Fim da jornada: agendou, compareceu, fechou.
create table etapas (
  id          bigserial primary key,
  lead_id     bigint not null references leads(id),
  etapa       text not null check (etapa in ('agendou', 'compareceu', 'fechou', 'perdido')),
  valor       numeric(12, 2),
  marcado_por text,  -- 'secretaria', 'ia'...
  ocorrido_em timestamptz not null default now()
);
create index etapas_lead on etapas (lead_id, ocorrido_em);
