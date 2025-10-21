import express from 'express';
import db from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ status: 'error', message: 'Por favor, preencha todos os campos.' });
  }


  try {
    const [rows] = await db.execute("SELECT * FROM usuario WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'E-mail não cadastrado.' });
    }

    const usuario = rows[0];

     if (usuario.status === 'inativo') {
      return res.status(403).json({ message: "Conta desativada. Reative para acessar." });
    }
    
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ status: 'error', message: 'Senha incorreta.' });
    }

  const token = jwt.sign(
  { 
    usuarioId: usuario.usuarioId, 
    nome: usuario.nome,  
    email: usuario.email 
  },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);

    return res.status(200).json({
      status: 'success',
      message: 'Login bem-sucedido.',
      token,
      usuario: {
        usuarioId: usuario.usuarioId,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (err) {
  console.error('Erro no login detalhado:', err);
  return res.status(500).json({ status: 'error', message: 'Erro no servidor.', erro: err.message });
}

});

app.put('/reativarperfil', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "E-mail é obrigatório." });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM usuario WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const usuario = rows[0];

    if (usuario.status === 'ativo') {
      return res.status(200).json({ message: "Conta já está ativa." });
    }

    await db.execute("UPDATE usuario SET status = 'ativo' WHERE email = ?", [email]);

    return res.status(200).json({ message: "Conta reativada com sucesso!" });
  } catch (err) {
    console.error("Erro ao reativar conta:", err);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
});


export default app;
