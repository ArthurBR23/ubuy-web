import express from 'express';
import db from './db.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());


const emailCorrespondeInstituicao = (email, dominioInstituicao) => {

  const dominioEsperado = dominioInstituicao.replace(/^@/, '').trim().toLowerCase();
  const dominioEmail = email.split('@')[1]?.trim().toLowerCase();

  if (!dominioEmail) return false;

  return dominioEmail === dominioEsperado || dominioEmail.endsWith(`.${dominioEsperado}`);
};

app.post('/cadastro', async (req, res) => {
  const { nome, email, cpf, data_nascimento, sexo, instituicao, senha, celular, sobrenome, curso } = req.body;
 


  if (!nome || !email || !cpf || !data_nascimento || !sexo || !instituicao || !senha || !celular || !sobrenome || !curso) {
    return res.status(400).json({ success: false, message: 'Preencha todos os campos!' });
  }


const anoNascimento = new Date(data_nascimento).getFullYear();
if (anoNascimento > 2009) {
  return res.status(400).json({
    success: false,
    message: 'Desculpe, apenas pessoas com 16 anos ou mais podem se cadastrar.'
  });
}


  try {
    const dominiosPath = path.resolve('./dominiosEducacionais.json');
    const dominiosRaw = fs.readFileSync(dominiosPath, 'utf8');
    const dominios = JSON.parse(dominiosRaw);

    console.log("📩 Dados recebidos:", req.body);
    console.log("📚 Instituições carregadas:", dominios.length);

const instituicaoEncontrada = dominios.find(i => {
  const nomeNormalizado = i.instituicao.replace(/\(.*?\)/, '').trim().toLowerCase();
  return (
    nomeNormalizado === instituicao.toLowerCase() ||
    i.instituicao.toLowerCase().includes(instituicao.toLowerCase())
  );
});

if (!instituicaoEncontrada) {
  return res.status(400).json({ success: false, message: 'Instituição inválida ou não encontrada.' });
}

if (!emailCorrespondeInstituicao(email, instituicaoEncontrada.dominio)) {
  return res.status(400).json({
    success: false,
    message: 'Selecione uma faculdade correspondente ao domínio utilizado.'
  });
}

    const [existente] = await db.execute('SELECT COUNT(*) as total FROM usuario WHERE email = ?', [email]);
    if (existente[0].total > 0) {
      return res.status(400).json({ success: false, message: 'Este e-mail já está cadastrado.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const query = `
      INSERT INTO usuario 
      (nome, sobrenome, email, cpf, data_nascimento, sexo, instituicao, senha, celular, dataCadastro, curso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await db.execute(query, [
      nome,
      sobrenome,
      email,
      cpf,
      data_nascimento,
      sexo,
      instituicao,
      senhaCriptografada,
      celular,
      curso
    ]);

    return res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    console.error('Erro no cadastro:', err.message);
    return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário.' });
  }
});

app.get('/universidades', (req, res) => {
  try {
    const filePath = path.resolve('./universidades.json');
    const raw = fs.readFileSync(filePath);
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    console.error('Erro ao carregar universidades locais:', err.message);
    res.status(500).json({ success: false, message: 'Erro ao buscar universidades.' });
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM usuario');
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    return res.status(500).json({ success: false, message: 'Erro no servidor', detalhe: err.message });
  }
});


export default app;
