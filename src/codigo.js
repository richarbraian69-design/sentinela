import { randomInt } from 'node:crypto';

// Sem 0, 1, I e O: ninguém confunde ao ler ou digitar.
const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const TAMANHO = 5;
const PADRAO_REF = new RegExp(`\\(\\s*ref\\.?\\s*([${ALFABETO}]{${TAMANHO}})\\s*\\)`, 'i');

export function gerarCodigo() {
  let codigo = '';
  for (let i = 0; i < TAMANHO; i += 1) codigo += ALFABETO[randomInt(ALFABETO.length)];
  return codigo;
}

// Mensagem que já vem escrita no WhatsApp da pessoa.
// Se a mensagem da clínica tiver {codigo}, ele entra ali; senão, vai no fim.
export function montarMensagem(base, codigo) {
  const texto = (base || '').trim();
  if (!codigo) return texto.replace(/\s*\{codigo\}/g, '').trim();
  if (texto.includes('{codigo}')) return texto.replace(/\{codigo\}/g, codigo);
  return `${texto} (ref. ${codigo})`.trim();
}

// Lê o código de volta quando a mensagem chega (usado na fase do WhatsApp).
export function extrairCodigo(texto) {
  const achado = PADRAO_REF.exec(texto || '');
  return achado ? achado[1].toUpperCase() : null;
}

export function linkWhatsApp(numero, mensagem) {
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

// Prévia de link e rastreadores não são pessoas clicando.
// "Instagram" e "FBAN" ficam de fora de propósito: são o navegador interno dos apps, gente de verdade.
const ROBOS = /bot\b|bot\/|crawler|spider|facebookexternalhit|facebot|meta-external|preview|curl\/|wget\/|python-requests|headless|slurp|monitor|uptime|^whatsapp\//i;

export function ehRobo(navegador) {
  if (!navegador || !navegador.trim()) return true;
  return ROBOS.test(navegador);
}

export function soDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}
