import express from 'express';
import db from './db.js';
import bcrypt from 'bcrypt';
import { enviarSMS, enviarWhatsApp } from './zenviaService.js';

const app = express();
app.use(express.json());

function gerarSenha(tamanho = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{};:,.<>?';
  let senha = '';
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

app.post('/senha', async (req, res) => {
  const { email, celular, canal } = req.body;

  if (!email || !celular) {
    return res.status(400).json({ status: 'error', message: 'Email e celular são obrigatórios.' });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM usuario WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'E-mail não cadastrado.' });
    }

    const novaSenha = gerarSenha();
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await db.execute('UPDATE usuario SET senha = ? WHERE email = ?', [senhaHash, email]);

    const mensagem = `Sua nova senha é: ${novaSenha}`;
  
    if (canal === 'sms') {
      await enviarSMS(celular, mensagem);
    } else {
      await enviarWhatsApp(celular, mensagem);
    }

    return res.status(200).json({ status: 'success', message: `Nova senha enviada via ${canal}!` });

  } catch (err) {
    console.error('Erro interno do servidor:', err);
    return res.status(500).json({ status: 'error', message: 'Erro interno do servidor.' });
  }
});

export default app;
