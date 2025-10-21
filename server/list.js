import db from './db.js';

async function listUsers() {
  try {
  const sql = `SELECT usuarioId, nome, email, fotoPerfil, cidade, status FROM usuario LIMIT 200`;
    const [rows] = await db.query(sql);
    console.log(JSON.stringify(rows, null, 2));
    // close pool
    await db.end();
  } catch (err) {
    console.error('Erro ao listar usuários:', err.message || err);
    try { await db.end(); } catch (e) {}
    process.exit(1);
  }
}

listUsers();