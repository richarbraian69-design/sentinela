import { soDigitos } from './codigo.js';

// Endereços que o próprio servidor usa e que não podem virar slug de clínica.
export const RESERVADOS = new Set(['admin', 'saude', 'api', 'webhook', 'webhooks', 'robots.txt', 'favicon.ico', 'static']);

const SLUG = /^[a-z0-9][a-z0-9-]{1,48}$/;
const ORIGEM = /^[a-z0-9][a-z0-9-]{0,31}$/;
const VALIDADE_MS = 60_000;

export const slugValido = (slug) => SLUG.test(slug) && !RESERVADOS.has(slug);
export const origemValida = (origem) => ORIGEM.test(origem);

// Confere e arruma os dados de uma clínica. Devolve { dados } ou { erro }.
export function validarClinica(entrada, { parcial = false } = {}) {
  const dados = {};
  const tem = (campo) => entrada[campo] !== undefined && entrada[campo] !== null;

  if (!parcial || tem('slug')) {
    const slug = String(entrada.slug ?? '').trim().toLowerCase();
    if (!slugValido(slug)) {
      return { erro: 'Endereço inválido: use letras minúsculas, números e hífen (ex.: dra-ana), de 2 a 49 caracteres.' };
    }
    dados.slug = slug;
  }
  if (!parcial || tem('nome')) {
    const nome = String(entrada.nome ?? '').trim();
    if (!nome) return { erro: 'Informe o nome da clínica.' };
    dados.nome = nome.slice(0, 120);
  }
  if (!parcial || tem('whatsapp')) {
    const whatsapp = soDigitos(entrada.whatsapp);
    if (whatsapp.length < 12 || whatsapp.length > 15) {
      return { erro: 'WhatsApp inválido: informe com código do país e DDD (ex.: 55 51 99999-0000).' };
    }
    dados.whatsapp = whatsapp;
  }
  if (tem('mensagem')) {
    const mensagem = String(entrada.mensagem).trim();
    if (mensagem) dados.mensagem = mensagem.slice(0, 500);
  }
  if (tem('ativa')) dados.ativa = Boolean(entrada.ativa);

  return { dados };
}

// Guarda as clínicas em memória por um minuto. Se o banco falhar, usa a última
// versão conhecida: o link da bio precisa continuar levando ao WhatsApp.
export function criarCacheDeClinicas(banco, { agora = () => Date.now() } = {}) {
  const cache = new Map();

  return {
    async buscar(slug) {
      const guardada = cache.get(slug);
      if (guardada && agora() - guardada.quando < VALIDADE_MS) return guardada.clinica;
      try {
        const { rows } = await banco.consulta(
          'select id, slug, nome, whatsapp, mensagem from clinicas where slug = $1 and ativa',
          [slug],
        );
        const clinica = rows[0] ?? null;
        cache.set(slug, { clinica, quando: agora() });
        return clinica;
      } catch (erro) {
        if (guardada) return guardada.clinica;
        throw erro;
      }
    },
    esquecer(slug) {
      if (slug) cache.delete(slug);
      else cache.clear();
    },
  };
}
