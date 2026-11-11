import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ehRobo, extrairCodigo, gerarCodigo, linkWhatsApp, montarMensagem } from '../src/codigo.js';
import { validarClinica } from '../src/clinicas.js';
import { NAVEGADOR_INSTAGRAM } from './apoio.js';

test('código tem 5 caracteres e nenhum que confunda', () => {
  for (let i = 0; i < 200; i += 1) assert.match(gerarCodigo(), /^[2-9A-HJ-NP-Z]{5}$/);
});

test('código vai no fim da mensagem e volta inteiro na leitura', () => {
  const codigo = gerarCodigo();
  const mensagem = montarMensagem('Olá! Quero agendar uma avaliação.', codigo);
  assert.equal(mensagem, `Olá! Quero agendar uma avaliação. (ref. ${codigo})`);
  assert.equal(extrairCodigo(mensagem), codigo);
  assert.equal(extrairCodigo(`${mensagem} Pode ser amanhã?`), codigo);
  assert.equal(extrairCodigo(mensagem.toLowerCase()), codigo);
});

test('mensagem com {codigo} recebe o código no lugar marcado', () => {
  assert.equal(montarMensagem('Oi (ref. {codigo}), quero agendar', 'B7K2M'), 'Oi (ref. B7K2M), quero agendar');
  assert.equal(montarMensagem('Oi, quero agendar {codigo}', null), 'Oi, quero agendar');
});

test('mensagem sem código não inventa código', () => {
  assert.equal(extrairCodigo('Olá, quero agendar'), null);
  assert.equal(extrairCodigo('(ref. ABC)'), null);
  assert.equal(extrairCodigo(null), null);
});

test('link do WhatsApp codifica a mensagem', () => {
  assert.equal(linkWhatsApp('5551999990000', 'Olá! (ref. B7K2M)'), 'https://wa.me/5551999990000?text=Ol%C3%A1!%20(ref.%20B7K2M)');
  assert.equal(linkWhatsApp('5551999990000', ''), 'https://wa.me/5551999990000');
});

test('robôs são reconhecidos, navegador do Instagram é gente', () => {
  assert.equal(ehRobo('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'), true);
  assert.equal(ehRobo('WhatsApp/2.23.20.0 A'), true);
  assert.equal(ehRobo('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'), true);
  assert.equal(ehRobo('curl/8.5.0'), true);
  assert.equal(ehRobo(''), true);
  assert.equal(ehRobo(undefined), true);
  assert.equal(ehRobo(NAVEGADOR_INSTAGRAM), false);
  assert.equal(ehRobo('Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'), false);
});

test('cadastro de clínica: confere e arruma os dados', () => {
  const boa = validarClinica({ slug: ' Dra-Ana ', nome: ' Dra. Ana ', whatsapp: '+55 (51) 99999-0000' });
  assert.deepEqual(boa.dados, { slug: 'dra-ana', nome: 'Dra. Ana', whatsapp: '5551999990000' });

  assert.ok(validarClinica({ slug: 'admin', nome: 'X', whatsapp: '5551999990000' }).erro);
  assert.ok(validarClinica({ slug: 'dra ana', nome: 'X', whatsapp: '5551999990000' }).erro);
  assert.ok(validarClinica({ slug: 'dra-ana', nome: '', whatsapp: '5551999990000' }).erro);
  assert.ok(validarClinica({ slug: 'dra-ana', nome: 'X', whatsapp: '99999-0000' }).erro);

  assert.deepEqual(validarClinica({ ativa: false }, { parcial: true }).dados, { ativa: false });
});
