import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import jwt from 'jsonwebtoken';
import { fileURLToPath } from "url";
import db from "./db.js";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const app = express();
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

function crc16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      else crc = (crc << 1) & 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function gerarPayloadPix({ chavePix, nome, cidade, valor, descricao }) {
  const EMV = [];

  EMV.push("00" + "02" + "01");

  const gui = "br.gov.bcb.pix";
  const key = chavePix || "";
  const infoAdicional = descricao || "";
  const subEMV = "00" + gui.length.toString().padStart(2, "0") + gui + "01" + key.length.toString().padStart(2, "0") + key;
  EMV.push("26" + subEMV.length.toString().padStart(2, "0") + subEMV);

  EMV.push("52" + "04" + "0000");

  EMV.push("53" + "03" + "986");

  if (valor) {
    const valorFormatado = Number(valor).toFixed(2);
    EMV.push("54" + valorFormatado.length.toString().padStart(2, "0") + valorFormatado);
  }

  EMV.push("58" + "02" + "BR");

  const nomeFormatado = (nome || "UBUY").substring(0,25);
  EMV.push("59" + nomeFormatado.length.toString().padStart(2, "0") + nomeFormatado);

  const cidadeFormatada = (cidade || "BRASILIA").substring(0,15);
  EMV.push("60" + cidadeFormatada.length.toString().padStart(2, "0") + cidadeFormatada);

  if (infoAdicional) {
    const info = "05" + infoAdicional.length.toString().padStart(2,"0") + infoAdicional;
    EMV.push("62" + info.length.toString().padStart(2,"0") + info);
  }

  const payloadSemCRC = EMV.join("") + "6304";
  const crc = crc16(payloadSemCRC);

  const payloadFinal = payloadSemCRC + crc;
  return payloadFinal;
}


app.get("/cursos", (req, res) => {
  try {
    const filePath = path.join(__dirname, "cursos.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    console.error("Erro ao carregar cursos locais:", err.message);
    res.status(500).json({ success: false, message: "Erro ao buscar cursos." });
  }
});


app.post("/anuncio", upload.array("fotos", 5), async (req, res) => {
  try {
    const { usuarioId, nome, descricao, preco, curso, condicao } = req.body;

    if (!usuarioId) return res.status(400).json({ erro: "Usuário não informado!" });
    if (!nome) return res.status(400).json({ erro: "Nome do produto é obrigatório!" });
    if (!descricao) return res.status(400).json({ erro: "Descrição do produto é obrigatória!" });
    if (!condicao) return res.status(400).json({ erro: "Condição do produto é obrigatório!" });
    if (!preco) return res.status(400).json({ erro: "Preço do produto é obrigatório!" });
    if (!curso) return res.status(400).json({ erro: "Curso é obrigatório!" });

    const fotos = req.files.map(f => f.filename);
    const fotoPrincipal = fotos[0] || null;

const [result] = await db.query(
  `INSERT INTO anuncio 
   (usuarioId, nome, descricao, preco, dataPublicacao, status, curso, foto, condicao)
   VALUES (?, ?, ?, ?, NOW(), 'ativo', ?, ?, ?)`,
  [usuarioId, nome, descricao, preco, curso, fotoPrincipal, condicao]
);

const anuncioId = result.insertId;

for (const foto of fotos) {
  await db.query(`INSERT INTO anuncio_fotos (anuncioId, foto) VALUES (?, ?)`, [anuncioId, foto]);
}

res.status(201).json({
  mensagem: "Anúncio criado com sucesso!",
  anuncioId,
  fotos
});

  } catch (err) {
    console.error("Erro ao criar anúncio:", err);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

/* app.get('/anuncio/home', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM anuncio'); 
    res.json(rows); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar anúncios' });
  }
}); */

app.get('/anuncio/home', async (req, res) => {
  try {
    let usuarioLogadoId = null;
    
    console.log("🔍 Headers recebidos:", req.headers.authorization);
    
    const token = req.headers.authorization?.split(" ")[1];
    console.log("🎫 Token extraído:", token ? "Existe" : "Não existe");
    
    if (token) {
      try {
        // Use jwt.decode() em vez de jwtDecode()
        const decoded = jwt.decode(token);
        usuarioLogadoId = decoded.usuarioId || decoded.id || decoded.userId;
        console.log("👤 usuarioLogadoId decodificado:", usuarioLogadoId);
        console.log("📦 Token completo decodificado:", decoded);
      } catch (err) {
        console.log("❌ Erro ao decodificar token:", err.message);
      }
    }

    let query = 'SELECT * FROM anuncio WHERE 1=1';
    const params = [];
    
    if (usuarioLogadoId) {
      query += ' AND usuarioId != ?';
      params.push(usuarioLogadoId);
      console.log("✅ Filtrando anúncios do usuário:", usuarioLogadoId);
    } else {
      console.log("⚠️ Nenhum usuário logado, mostrando todos os anúncios");
    }
    
    query += ' ORDER BY anuncioId DESC';
    
    console.log("📝 Query final:", query);
    console.log("📋 Params:", params);

    const [rows] = await db.execute(query, params);
    console.log("📊 Total de anúncios retornados:", rows.length);
    
    res.json(rows); 
  } catch (error) {
    console.error("❌ Erro:", error);
    res.status(500).json({ error: 'Erro ao buscar anúncios' });
  }
});

app.get("/anuncio/detalhes/:anuncioId", async (req, res) => {
  try {
    const { anuncioId } = req.params;

    const [anuncios] = await db.query(
      `SELECT 
         a.*, 
         u.nome AS usuarioNome,
         u.curso,
         u.dataCadastro,
         ROUND(AVG(av.nota), 1) AS mediaAvaliacoes,
         COUNT(av.avaliacoesId) AS totalAvaliacoes
       FROM anuncio a
       JOIN usuario u ON a.usuarioId = u.usuarioId
       LEFT JOIN avaliacoes av ON av.usuarioAvaliadoId = u.usuarioId
       WHERE a.anuncioId = ?
       GROUP BY 
         a.anuncioId, 
         a.usuarioId, 
         u.nome, 
         u.curso, 
         u.dataCadastro`,
      [anuncioId]
    );

    if (!anuncios.length)
      return res.status(404).json({ erro: "Anúncio não encontrado" });

    const anuncio = anuncios[0];

    const [fotos] = await db.query(
      `SELECT foto FROM anuncio_fotos WHERE anuncioId = ?`,
      [anuncioId]
    );

    anuncio.fotos = fotos.map(f => f.foto);

    res.json(anuncio);
  } catch (err) {
    console.error("Erro ao buscar detalhes do anúncio:", err);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});


app.get("/anuncio/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const [anuncios] = await db.query(
      `SELECT *, anuncioId AS anuncioId FROM anuncio WHERE usuarioId = ?`,
      [usuarioId]
    );

    for (let anuncio of anuncios) {
      const [fotos] = await db.query(
        `SELECT foto FROM anuncio_fotos WHERE anuncioId = ?`,
        [anuncio.anuncioId]
      );
      anuncio.fotos = fotos.map(f => f.foto);
    }

    res.json(anuncios);
  } catch (err) {
    console.error("Erro ao listar anúncios:", err);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

app.patch("/anuncio/:anuncioId/desativar", async (req, res) => {
  const anuncioId = req.params.anuncioId;

  try {
    const [result] = await db.execute(
      "UPDATE anuncio SET status = 'inativo' WHERE anuncioId = ?",
      [anuncioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Anúncio não encontrado" });
    }

    res.json({ mensagem: "Anúncio desativado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao desativar anúncio" });
  }
});

app.patch("/anuncio/:anuncioId/ativar", async (req, res) => {
  const anuncioId = req.params.anuncioId;

  try {
    const [result] = await db.execute(
      "UPDATE anuncio SET status = 'ativo' WHERE anuncioId = ?",
      [anuncioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Anúncio não encontrado" });
    }

    res.json({ mensagem: "Anúncio desativado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao ativar anúncio" });
  }
});

app.delete("/anuncio/:anuncioId", async (req, res) => {
  const anuncioId = req.params.anuncioId;

  try {
    const [result] = await db.execute(
      "DELETE FROM anuncio WHERE anuncioId = ?",
      [anuncioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Anúncio não encontrado" });
    }

    res.json({ mensagem: "Anúncio excluído com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao excluir anúncio" });
  }
});

app.patch("/anuncio/:anuncioId", upload.array("fotos", 10), async (req, res) => {
  const anuncioId = req.params.anuncioId;
  const { nome, descricao, preco, curso, localizacao, condicao, fotosRemovidas = [] } = req.body;
  const novasFotos = req.files.map(f => f.filename);

  try {

    await db.query(
      `UPDATE anuncio SET 
         nome = ?, descricao = ?, preco = ?, curso = ?, localizacao = ?, condicao = ? 
       WHERE anuncioId = ?`,
      [nome, descricao, preco, curso, localizacao, condicao, anuncioId]
    );

    if (fotosRemovidas.length > 0) {
      await db.query(
        `DELETE FROM anuncio_fotos WHERE anuncioId = ? AND foto IN (?)`,
        [anuncioId, fotosRemovidas]
      );

      fotosRemovidas.forEach(f => {
        const filePath = path.join(__dirname, "uploads", f);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    for (const foto of novasFotos) {
      await db.query(
        `INSERT INTO anuncio_fotos (anuncioId, foto) VALUES (?, ?)`,
        [anuncioId, foto]
      );
    }

    const [fotosAtuais] = await db.query(
      `SELECT foto FROM anuncio_fotos WHERE anuncioId = ?`,
      [anuncioId]
    );

    res.json({
      mensagem: "Anúncio atualizado com sucesso!",
      fotos: fotosAtuais.map(f => f.foto)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

app.post("/anuncio/gerarpix", async (req, res) => {
  try {
    const { valor, chavePix, descricao, nome, cidade, anuncioId, idComprador } = req.body;

    if (!anuncioId || !idComprador) {
      return res.status(400).json({ error: "Campos obrigatórios: anuncioId e idComprador." });
    }

    if (!chavePix || !valor) {
      return res.status(400).json({ error: "Campos obrigatórios: chavePix e valor." });
    }

    await db.query("UPDATE anuncio SET status = 'vendido' WHERE anuncioId = ?", [anuncioId]);

    await db.query(
      "INSERT INTO compras (usuarioId, anuncioId) VALUES (?, ?)",
      [idComprador, anuncioId]
    );

    const payload = gerarPayloadPix({ chavePix, nome, cidade, valor, descricao });
    const qrBuffer = await QRCode.toBuffer(payload, { type: "png", width: 400 });
    const base64Image = qrBuffer.toString("base64");

    res.json({
      payload,
      imagemBase64: base64Image,
    });
  } catch (err) {
    console.error("Erro ao gerar QR PIX:", err);
    res.status(500).json({ error: "Erro interno ao gerar QR Code Pix." });
  }
});

app.post('/anuncio/confirmar-pagamento', async (req, res) => {
  const { anuncioId } = req.body;

  try {
    await db.query('UPDATE anuncio SET status = ? WHERE anuncioId = ?', ['vendido', anuncioId]);
    res.json({ success: true, message: 'Anúncio marcado como vendido!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar status para vendido.' });
  }
});



app.get('/categoria', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT categoriaID, nome FROM categoria ORDER BY nome');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar categorias', error: err.message });
  }
});

app.get('/anuncio/categoria/:categoriaId', async (req, res) => {
  const { categoriaId } = req.params;
  try {
    const [rows] = await db.execute(
      'SELECT * FROM anuncio WHERE categoriaID = ? ORDER BY dataPublicacao DESC',
      [categoriaId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar anúncios por categoria', error: err.message });
  }
});



export default app;


