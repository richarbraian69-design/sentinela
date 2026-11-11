import pg from 'pg';

// Interface mínima usada pelo resto do código:
//   consulta(sql, valores)  uma instrução com parâmetros
//   executa(sql)            uma ou mais instruções, sem parâmetros
//   transacao(sql)          várias instruções: ou entram todas, ou nenhuma
// Os testes trocam esta implementação por um Postgres embutido.
export function criarBanco(url) {
  if (!url) throw new Error('DATABASE_URL não definida');

  const interno = /\.railway\.internal|localhost|127\.0\.0\.1/.test(url);
  const pool = new pg.Pool({
    connectionString: url,
    ssl: interno ? false : { rejectUnauthorized: false },
    max: 5,
  });

  // Erro em conexão ociosa não pode derrubar o servidor.
  pool.on('error', (erro) => console.error('[banco] conexão ociosa falhou:', erro.message));

  return {
    consulta: (sql, valores = []) => pool.query(sql, valores),
    executa: (sql) => pool.query(sql),
    async transacao(sql) {
      const cliente = await pool.connect();
      try {
        await cliente.query('begin');
        await cliente.query(sql);
        await cliente.query('commit');
      } catch (erro) {
        await cliente.query('rollback').catch(() => {});
        throw erro;
      } finally {
        cliente.release();
      }
    },
    fecha: () => pool.end(),
  };
}
