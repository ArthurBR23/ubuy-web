import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

app.get("/anuncio/:anuncioId", async (req, res) => {
  const anuncioId = Number(req.params.anuncioId);
  if (isNaN(anuncioId)) return res.status(400).json({ error: "ID inválido" });

  try {
    const [rows] = await db.query(
      `SELECT a.anuncioId, a.anuncioNome AS nome, a.descricao, a.curso, a.preco, a.usuarioId, u.nome AS usuarioNome
       FROM anuncio a
       JOIN usuario u ON a.usuarioId = u.usuarioId
       WHERE a.anuncioId = ?`,
      [anuncioId]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Anúncio não encontrado" });

    const [fotos] = await db.query(
      "SELECT foto FROM anuncio_fotos WHERE anuncioId = ?",
      [anuncioId]
    );

    rows[0].fotos = fotos.map(f => f.foto);
    rows[0].foto = fotos[0] || null;

    console.log("Anúncio encontrado:", rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar anúncio:", err);
    res.status(500).json({ error: "Erro ao buscar anúncio" });
  }
});

app.get("/usuario/:usuarioId/anuncios", async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  if (isNaN(usuarioId)) return res.status(400).json({ error: "ID de usuário inválido" });

  try {
    const [anuncios] = await db.query(
      "SELECT anuncioId, anuncioNome AS nome, descricao, curso, preco, usuarioId FROM anuncio WHERE usuarioId = ?",
      [usuarioId]
    );

    for (const anuncio of anuncios) {
      const [fotos] = await db.query(
        "SELECT foto FROM anuncio_fotos WHERE anuncioId = ?",
        [anuncio.anuncioId]
      );
      anuncio.fotos = fotos.map(f => f.foto);
      anuncio.foto = fotos[0] || null;
    }

    res.json(anuncios);
  } catch (err) {
    console.error("Erro ao buscar anúncios do usuário:", err);
    res.status(500).json({ error: "Erro ao buscar anúncios do usuário" });
  }
});

export default app;
