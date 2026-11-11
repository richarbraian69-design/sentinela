# Sentinela

Jornada do lead das clínicas, do primeiro toque até a venda.

O objetivo é ver, para cada lead, o que ela fez antes de fechar a agenda: em quais anúncios clicou, o que comentou, a que story respondeu, quando clicou na bio, o que conversou e o que disse ter visto.

## O que já funciona

### Fundação (fase 1)

Banco Postgres com as peças da jornada:

| Tabela | Guarda |
|---|---|
| `clinicas` | Clínica atendida, WhatsApp e mensagem pré-preenchida |
| `leads` | Uma pessoa, com telefone e @ como chaves |
| `conteudos` | Anúncios, posts, reels e stories, com etiqueta de tipo |
| `cliques` | Cliques nos links rastreados |
| `toques` | Cada interação da lead; em ordem, formam a linha do tempo |
| `mensagens` | Conversa completa, nos dois sentidos |
| `etapas` | Agendou, compareceu, fechou |

As tabelas são criadas sozinhas quando o servidor sobe (arquivos em `migrations/`).

### Link rastreado (fase 2)

O link da bio deixa de ser o `wa.me` direto e passa a ser um endereço do Sentinela:

```
https://<dominio>/<clinica>/bio
https://<dominio>/<clinica>/stories
https://<dominio>/<clinica>/destaque
```

A última parte é livre (`google`, `site`, `cartao`...). Sem ela, vale como `bio`.

Em cada clique o servidor:

1. registra data, hora, origem e navegador;
2. gera um código curto (ex.: `B7K2M`);
3. leva a pessoa ao WhatsApp da clínica com a mensagem já escrita e o código no fim: `Olá! Vim pelo Instagram e quero agendar uma avaliação. (ref. B7K2M)`.

Quando a mensagem chegar pela API do WhatsApp (fase 3), o código liga o telefone ao clique.

Cuidados embutidos:

- Se o banco falhar, a pessoa é levada ao WhatsApp do mesmo jeito, sem código.
- Prévia de link e rastreadores são marcados como robô e ficam fora das contagens.
- O servidor não guarda o IP de quem clica.
- Um cookie próprio (`snt_v`) liga cliques feitos no mesmo navegador.

Para colocar o código em outro ponto da mensagem, use `{codigo}` no texto da clínica.

### Painel

Em `/admin`, na mesma identidade do Ora et Labora, do Celeiro e do Forja:

- **Visão geral:** cliques por dia, clínicas sob vigia e os números da semana.
- **Jornada do lead:** a linha do tempo de cada pessoa (o que fez e o que disse ter visto) e o que as jornadas de quem agendou têm em comum. Enquanto a clínica não tem leads, mostra fichas de exemplo, marcadas como exemplo.
- **Links rastreáveis:** um link por ponto de contato, com cliques e conversas.
- **Cliques** e **Ajustes** da clínica.

## Configuração

| Variável | Para quê |
|---|---|
| `DATABASE_URL` | Endereço do Postgres |
| `ADMIN_TOKEN` | Senha do painel. Sem ela o painel fica desligado; os links seguem funcionando |
| `PORT` | Porta do servidor (o Railway define sozinho) |

## Rodar no computador

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL e ADMIN_TOKEN
node --env-file=.env src/index.js
```

## Testes

```bash
npm test
```

Os testes usam um Postgres embutido, sem precisar de banco instalado.

## Próximas fases

- Fase 3: WhatsApp (mensagens, anúncio de origem, leitura do código)
- Fase 4: Instagram (Direct, comentários, respostas a story, catálogo de conteúdos)
- Fase 5: união de telefone e @, marcação de etapas
- Fase 6: leitura das conversas por IA e pergunta de reconhecimento
- Fase 7: linha do tempo por lead e painel de padrões
