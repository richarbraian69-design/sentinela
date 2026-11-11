import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { ehRobo, gerarCodigo, linkWhatsApp, montarMensagem } from '../codigo.js';
import { origemValida, slugValido } from '../clinicas.js';

const COOKIE = 'snt_v';
const UM_ANO = 365 * 24 * 60 * 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const TENTATIVAS = 5;

function lerCookie(req, nome) {
  for (const parte of (req.headers.cookie || '').split(';')) {
    const [chave, ...resto] = parte.trim().split('=');
    if (chave === nome) return resto.join('=');
  }
  return null;
}

const cortar = (texto, limite) => (texto ? String(texto).slice(0, limite) : null);

// Link rastreado: /<clinica> ou /<clinica>/<origem> (bio, stories, destaque...).
// Registra o clique e leva a pessoa ao WhatsApp da clínica com um código na mensagem.
export function rotasDoLink({ banco, clinicas }) {
  const rotas = Router();

  async function registrarClique({ clinica, origem, codigo, visitante, navegador, veioDe, robo }) {
    const { rows } = await banco.consulta(
      `insert into cliques (clinica_id, origem, codigo, visitante_id, navegador, veio_de, robo)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (codigo) do nothing
       returning id`,
      [clinica.id, origem, codigo, visitante, navegador, veioDe, robo],
    );
    return rows.length > 0;
  }

  async function redirecionar(req, res) {
    const slug = String(req.params.slug || '').toLowerCase();
    const origem = String(req.params.origem || 'bio').toLowerCase();
    if (!slugValido(slug) || !origemValida(origem)) return res.status(404).type('text').send('Link não encontrado.');

    let clinica;
    try {
      clinica = await clinicas.buscar(slug);
    } catch (erro) {
      console.error('[link] banco indisponível ao buscar a clínica:', erro.message);
      return res.status(503).type('text').send('Serviço indisponível no momento. Tente de novo em instantes.');
    }
    if (!clinica) return res.status(404).type('text').send('Link não encontrado.');

    res.set('Cache-Control', 'no-store');
    res.set('X-Robots-Tag', 'noindex, nofollow');

    const navegador = cortar(req.get('user-agent'), 400);
    const veioDe = cortar(req.get('referer'), 400);
    const robo = ehRobo(navegador);
    const semCodigo = linkWhatsApp(clinica.whatsapp, montarMensagem(clinica.mensagem, null));

    // HEAD e robôs: mesmo destino, sem código. Robô fica registrado para dar para filtrar.
    if (req.method === 'HEAD') return res.redirect(302, semCodigo);
    if (robo) {
      registrarClique({ clinica, origem, codigo: null, visitante: null, navegador, veioDe, robo: true })
        .catch((erro) => console.error('[link] falha ao registrar robô:', erro.message));
      return res.redirect(302, semCodigo);
    }

    const cookie = lerCookie(req, COOKIE);
    const visitante = cookie && UUID.test(cookie) ? cookie : randomUUID();

    // Se o registro falhar, a pessoa segue para o WhatsApp do mesmo jeito, sem código.
    let codigo = null;
    try {
      for (let i = 0; i < TENTATIVAS && !codigo; i += 1) {
        const candidato = gerarCodigo();
        if (await registrarClique({ clinica, origem, codigo: candidato, visitante, navegador, veioDe, robo: false })) {
          codigo = candidato;
        }
      }
    } catch (erro) {
      console.error('[link] falha ao registrar clique:', erro.message);
    }

    res.set('Set-Cookie', `${COOKIE}=${visitante}; Max-Age=${UM_ANO}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    return res.redirect(302, codigo ? linkWhatsApp(clinica.whatsapp, montarMensagem(clinica.mensagem, codigo)) : semCodigo);
  }

  rotas.get('/:slug', redirecionar);
  rotas.get('/:slug/:origem', redirecionar);
  return rotas;
}
