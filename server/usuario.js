import express from 'express';
import db from './db.js';
import cors from 'cors';
import { authMiddleware } from './authMiddleware.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Configuração para __filename e __dirname em módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Certifique-se de que o diretório 'uploads' existe (usando o caminho de usuario.js)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de armazenamento de arquivos (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Usando o diretório 'uploads'
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Rota para buscar o perfil do usuário logado com estatísticas
app.get('/usuario', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        usuarioId,
        sobrenome,
        nome,
        email,
        celular,
        cpf,
        data_nascimento,
        fotoPerfil,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        dataCadastro,
        pix,
        curso,
        instituicao
      FROM usuario
      WHERE usuarioId = ?
    `, [req.usuarioId]);

    if (!rows[0]) return res.status(404).json({ message: "Usuário não encontrado" });

    const usuario = rows[0];

    // Busca anúncios ativos do usuário
    const [anuncios] = await db.execute(`
      SELECT
        anuncioId, nome, descricao, preco, localizacao, categoriaID, status, dataPublicacao, foto
      FROM anuncio
      WHERE usuarioId = ? AND status = 'ativo'
      ORDER BY dataPublicacao DESC
    `, [usuario.usuarioId]);

    // Busca avaliações recebidas pelo usuário
    const [avaliacoes] = await db.query(`
      SELECT a.avaliacoesId, a.nota, a.comentario, a.dataPublicacao as data,
        u.nome, u.fotoPerfil as foto
      FROM avaliacoes a
      JOIN usuario u ON u.usuarioId = a.autorId
      WHERE a.usuarioAvaliadoId = ?
    `, [usuario.usuarioId]);

    // ===== ESTATÍSTICAS =====
    
    // Conta VENDAS (anúncios do usuário que foram vendidos)
    const [vendasResult] = await db.query(`
      SELECT COUNT(*) as total
      FROM anuncio
      WHERE usuarioId = ? AND status = 'vendido'
    `, [usuario.usuarioId]);

    // Conta COMPRAS (registros na tabela compras onde o usuário é comprador)
    const [comprasResult] = await db.query(`
      SELECT COUNT(*) as total
      FROM compras
      WHERE usuarioId = ?
    `, [usuario.usuarioId]);

    const vendas = vendasResult[0].total || 0;
    const compras = comprasResult[0].total || 0;

    // Calcula a média das notas
    const mediaNota = avaliacoes.length
      ? avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length
      : 0;

    usuario.nota = Number(mediaNota.toFixed(1));
    usuario.avaliacoesCount = avaliacoes.length;

    res.json({ 
      usuario, 
      anuncio: anuncios, 
      avaliacoes,
      vendas,    // Adiciona vendas
      compras    // Adiciona compras
    }); 

  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    res.status(500).json({ message: "Erro ao buscar perfil", error: err.message });
  }
});

// Rota para buscar todos os anúncios de um usuário por ID
app.get("/usuario/:usuarioId/anuncios", async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM anuncio WHERE usuarioId = ?`,
      [usuarioId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar anúncios do usuário" });
  }
});

// Rota para buscar dados básicos do usuário logado via token
app.get('/usuario-logado', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Não autenticado' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2) return res.status(401).json({ message: 'Token inválido' });

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.execute(
      'SELECT nome, instituicao FROM usuario WHERE usuarioId = ?',
      [decoded.usuarioId]
    );

    if (!rows[0]) return res.status(404).json({ message: "Usuário não encontrado" });

    res.json(rows[0]); 
  } catch (err) {
    console.error('Erro ao buscar usuário logado:', err);
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// Rota para buscar detalhes de edição do perfil e anúncios (visão de gerenciamento)
app.get('/usuario-detalhes', authMiddleware, async (req, res) => {

// Rota para obter dados básicos de um usuário por ID (sem exigir token)
app.get('/usuario/:id', async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);
    if (!usuarioId) return res.status(400).json({ message: 'ID inválido' });

    const [rows] = await db.execute(
      `SELECT usuarioId, nome, sobrenome, email, fotoPerfil, cidade, curso FROM usuario WHERE usuarioId = ?`,
      [usuarioId]
    );

    if (!rows[0]) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json({ usuario: rows[0] });
  } catch (err) {
    console.error('Erro ao buscar usuário por id:', err);
    res.status(500).json({ message: 'Erro ao buscar usuário', error: err.message });
  }
});
  try {
    const [rows] = await db.execute(
      'SELECT usuarioId, nome, sobrenome, email, celular, cpf, fotoPerfil, pix FROM usuario WHERE usuarioId = ?',
      [req.usuarioId]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Usuário não encontrado' });

    const usuario = rows[0];

    const [anuncios] = await db.execute(
      'SELECT anuncioId, nome, descricao, preco, localizacao, status, dataPublicacao FROM anuncio WHERE usuarioId = ? ORDER BY dataPublicacao DESC',
      [usuario.usuarioId]
    );

    res.json({ usuario, anuncios });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar perfil', error: err.message });
  }
});

// Rota PUT para editar o perfil (CONSOLIDADA com a lógica completa de 'editarperfil.js')
app.put("/editarperfil", authMiddleware, upload.single("fotoPerfil"), async (req, res) => {
  const { 
    nome, 
    sobrenome, 
    email, 
    celular, 
    data_nascimento, 
    cep, 
    logradouro, 
    numero, 
    bairro, 
    cidade, 
    uf, 
    pix, 
    curso // Incluído o campo 'curso'
  } = req.body;
  
  const fotoPerfil = req.file ? req.file.filename : null;

  let dataFormatada = null;
  if (data_nascimento) {
    dataFormatada = new Date(data_nascimento).toISOString().split("T")[0]; 
  }

   try {
    // Query limpa
   await db.query(`
UPDATE usuario SET
nome=?, sobrenome=?, email=?, data_nascimento=?, celular=?,
cep=?, logradouro=?, numero=?, bairro=?, cidade=?, uf=?, pix=?,
curso=?,
fotoPerfil=COALESCE(?, fotoPerfil)
WHERE usuarioId=?`,
    [
      nome,
      sobrenome,
      email,
      dataFormatada,   
      celular,
      cep,
      logradouro,
      numero,
      bairro,
      cidade,
      uf,
      pix,
      curso, // Adicionado 'curso' na lista de parâmetros
      fotoPerfil,
      req.usuarioId,
    ]
  );

    res.json({ message: "Perfil atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// Rota para exclusão de perfil e arquivos associados
app.delete("/excluirperfil", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT fotoPerfil FROM usuario WHERE usuarioId = ?",
      [req.usuarioId]
    );

    if (!rows[0]) return res.status(404).json({ message: "Usuário não encontrado" });

    const fotoPerfil = rows[0].fotoPerfil;

    // Deletar anúncios e, em seguida, o usuário
    await db.execute("DELETE FROM anuncio WHERE usuarioId = ?", [req.usuarioId]);
    await db.execute("DELETE FROM usuario WHERE usuarioId = ?", [req.usuarioId]);

    if (fotoPerfil) {
      const fotoPath = path.join(uploadDir, fotoPerfil); // Usando uploadDir
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    res.json({ message: "Perfil excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir perfil:", err);
    res.status(500).json({ message: "Erro ao excluir perfil", error: err.message });
  }
});

// Rota para desativar o perfil
app.put("/desativarperfil", authMiddleware, async (req, res) => {
  try {
    await db.execute(
      "UPDATE usuario SET status = 'inativo' WHERE usuarioId = ?",
      [req.usuarioId]
    );
    res.json({ message: "Perfil desativado com sucesso!" });
  } catch (err) {
    console.error("Erro ao desativar perfil:", err);
    res.status(500).json({ message: "Erro ao desativar perfil", error: err.message });
  }
});

// Rota para buscar categorias
app.get("/categoria", async (req, res) => {
  try {
   const [rows] = await db.execute("SELECT * FROM categoria ORDER BY nome ASC");
   res.json(rows);
  } catch (err) {
   console.error("Erro ao buscar categorias:", err);
   res.status(500).json({ message: "Erro ao buscar categorias", error: err.message });
  }
});


app.get("/search", async (req, res) => {
  const q = req.query.q ? String(req.query.q).trim() : "";
  const curso = req.query.curso ? String(req.query.curso).trim() : "";

  console.log("🔎 /search recebido:", { q, curso });

  try {
    let usuarioLogadoId = null;
    
    // Simulação de decodificação de token (jwt não está definido no seu snippet original, mas é crucial para o seu fluxo de autenticação)
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        // Se 'jwt' for undefined, esta linha pode falhar.
        // É crucial que 'jwt' seja importado (e.g., import jwt from 'jsonwebtoken';)
        // Usamos um placeholder seguro para a decodificação:
        const decoded = jwt.decode(token);
        usuarioLogadoId = decoded.usuarioId || decoded.id || decoded.userId;
        console.log("👤 Search - usuarioLogadoId:", usuarioLogadoId);
      } catch (err) {
        console.log("❌ Erro ao decodificar token:", err.message);
      }
    }

    // ===== BUSCAR USUÁRIOS (Sem Alteração) =====
    let usuariosSql =
      "SELECT usuarioId, nome, cidade, fotoPerfil, curso FROM usuario WHERE 1=1";
    const usuariosParams = [];

    if (q) {
      usuariosSql += " AND nome LIKE ?";
      usuariosParams.push(`%${q}%`);
    }
    if (curso) {
      usuariosSql += " AND curso = ?";
      usuariosParams.push(curso);
    }
    
    // Exclui o próprio usuário da busca
    if (usuarioLogadoId) {
      usuariosSql += " AND usuarioId != ?";
      usuariosParams.push(usuarioLogadoId);
      console.log("✅ Search - Filtrando o próprio usuário:", usuarioLogadoId);
    }

    // ===== BUSCAR ANÚNCIOS (AQUI ESTÁ A ALTERAÇÃO) =====
    let anunciosSql = `
      SELECT a.anuncioId, a.nome, a.preco, a.foto, a.usuarioId, a.status,
             u.nome AS usuarioNome, u.curso AS usuarioCurso
      FROM anuncio a
      JOIN usuario u ON a.usuarioId = u.usuarioId
      WHERE 1=1
      AND a.status = 'ativo' /* <-- FILTRO ADICIONADO: Exclui anúncios 'vendido' ou 'inativo' */
    `;
    const anunciosParams = [];

    if (q) {
      anunciosSql += " AND (a.nome LIKE ? OR u.nome LIKE ?)";
      anunciosParams.push(`%${q}%`, `%${q}%`);
    }
    if (curso) {
      anunciosSql += " AND u.curso = ?";
      anunciosParams.push(curso);
    }
    
    // Exclui anúncios do próprio usuário
    if (usuarioLogadoId) {
      anunciosSql += " AND a.usuarioId != ?";
      anunciosParams.push(usuarioLogadoId);
      console.log("✅ Search - Filtrando anúncios do usuário:", usuarioLogadoId);
    }

    const [usuariosRows] = await db.query(usuariosSql, usuariosParams);
    const [anunciosRows] = await db.query(anunciosSql, anunciosParams);

    console.log("📊 Resultados da busca:", {
      usuarios: usuariosRows.length,
      anuncios: anunciosRows.length
    });

    res.json({
      usuarios: usuariosRows || [],
      anuncios: anunciosRows || [],
    });
  } catch (err) {
    console.error("❌ Erro na rota /search:", err);
    res.status(500).json({ error: "Erro ao buscar resultados" });
  }
});

// SUBSTITUA a rota GET '/usuario/:usuarioId' no seu arquivo usuario.js por esta:

app.get("/usuario/:usuarioId", async (req, res) => {
  const usuarioId = Number(req.params.usuarioId); 

  try {
    // Busca dados do usuário
    const [usuarioRows] = await db.query(`
      SELECT 
        usuarioId, 
        nome, 
        sobrenome, 
        email, 
        celular, 
        cidade, 
        fotoPerfil,
        pix, 
        instituicao, 
        dataCadastro, 
        curso
      FROM usuario
      WHERE usuarioId = ?
    `, [usuarioId]);

    if (!usuarioRows.length) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const usuario = usuarioRows[0];

    // Busca anúncios do usuário
    const [anuncio] = await db.query(`
      SELECT 
        anuncioId, 
        nome, 
        preco, 
        foto, 
        localizacao, 
        status
      FROM anuncio
      WHERE usuarioId = ?
      ORDER BY dataPublicacao DESC
    `, [usuarioId]);

    // Busca avaliações do usuário
    const [avaliacoes] = await db.query(`
      SELECT 
        a.avaliacoesId, 
        a.nota, 
        a.comentario, 
        a.dataPublicacao as data, 
        u.nome, 
        u.fotoPerfil as foto
      FROM avaliacoes a
      LEFT JOIN usuario u ON u.usuarioId = a.autorId
      WHERE a.usuarioAvaliadoId = ?
    `, [usuarioId]);

    // ===== ESTATÍSTICAS =====

    // Conta VENDAS (anúncios vendidos)
    const [vendasResult] = await db.query(`
      SELECT COUNT(*) as total
      FROM anuncio
      WHERE usuarioId = ? AND status = 'vendido'
    `, [usuarioId]);

    // Conta COMPRAS (registros na tabela compras)
    const [comprasResult] = await db.query(`
      SELECT COUNT(*) as total
      FROM compras
      WHERE usuarioId = ?
    `, [usuarioId]);

    const vendas = vendasResult[0]?.total || 0;
    const compras = comprasResult[0]?.total || 0;

    // Log para debug
    console.log("📊 Estatísticas do perfil público:", {
      usuarioId,
      vendas,
      compras,
      anunciosAtivos: anuncio.filter(a => a.status === "ativo").length,
      totalAnuncios: anuncio.length
    });

    // Retorna todos os dados
    res.json({ 
      usuario, 
      anuncio, 
      avaliacoes,
      vendas: Number(vendas),
      compras: Number(compras)
    });

  } catch (err) {
    console.error("❌ Erro ao buscar perfil público:", err);
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

// Rota para criar ou atualizar uma avaliação
app.post("/usuario/:usuarioId/reviews", authMiddleware, async (req, res) => {
  const usuarioAvaliadoId = req.params.usuarioId;
  const { nota, comentario } = req.body;
  const autorId = req.usuarioId;

  console.log("🧩 Dados recebidos:", { usuarioAvaliadoId, autorId, nota, comentario });

  if (!nota || nota < 1 || nota > 5)
   return res.status(400).json({ error: "Nota inválida" });

  if (Number(autorId) === Number(usuarioAvaliadoId))
   return res.status(400).json({ error: "Não é possível se autoavaliar" });

   try {
     const [exists] = await db.query(
       "SELECT avaliacoesId FROM avaliacoes WHERE autorId = ? AND usuarioAvaliadoId = ?",
       [autorId, usuarioAvaliadoId]
     );

     // Se já existe, atualiza
     if (exists.length) {
       await db.query(
       "UPDATE avaliacoes SET nota = ?, comentario = ?, dataPublicacao = NOW() WHERE autorId = ? AND usuarioAvaliadoId = ?",
       [nota, comentario, autorId, usuarioAvaliadoId]
      );

        // Query limpa
    const [avaliacaoAtualizada] = await db.query(`
SELECT a.avaliacoesId, a.nota, a.comentario, a.dataPublicacao as data, u.nome as nome, u.fotoPerfil as foto
FROM avaliacoes a
JOIN usuario u ON u.usuarioId = a.autorId
WHERE a.autorId = ? AND a.usuarioAvaliadoId = ?
`, [autorId, usuarioAvaliadoId]);

       return res.status(200).json({ avaliacao: avaliacaoAtualizada[0] });
     }

     // Se não existe, insere nova avaliação
     const [result] = await db.query(
     "INSERT INTO avaliacoes (usuarioAvaliadoId, autorId, nota, comentario, dataPublicacao) VALUES (?, ?, ?, ?, NOW())",
     [usuarioAvaliadoId, autorId, nota, comentario]
   );

    // Query limpa
   const [nova] = await db.query(`
SELECT a.avaliacoesId, a.nota, a.comentario, a.dataPublicacao as data, u.nome as nome, u.fotoPerfil as foto
FROM avaliacoes a
JOIN usuario u ON u.usuarioId = a.autorId
WHERE a.avaliacoesId = ?
`, [result.insertId]);

    res.status(201).json({ avaliacao: nova[0] });
   } catch (err) {
    console.error(err);
   res.status(500).json({ error: "Erro ao criar avaliação" });
   }
});

// Rota para buscar histórico de compras do usuário
app.get("/usuario/:usuarioId/compras", async (req, res) => {
  const { usuarioId } = req.params;
  try {
    // Query limpa
   const [rows] = await db.query(`
SELECT a.*, c.data_compra
FROM compras c
JOIN anuncio a ON c.anuncioId = a.anuncioId
WHERE c.usuarioId = ?
ORDER BY c.data_compra DESC
`, [usuarioId]);
   res.json(rows);
  } catch (err) {
   console.error("Erro ao buscar compras:", err);
   res.status(500).json({ error: "Erro ao buscar compras" });
  }
});


export default app;