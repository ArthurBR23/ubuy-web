import express from "express";
import db from "./db.js";
import cors from 'cors';
import dotenv from 'dotenv';
import jwtDecode from "jwt-decode";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/minhascompras", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Não autorizado" });

    const usuario = jwtDecode(token); 
    const usuarioId = usuario.usuarioId || usuario.id || usuario.userId

    if (!usuarioId) {
      console.warn("Token não contém usuarioId:", usuario);
      return res.status(400).json({ error: "Token inválido (usuarioId ausente)" });
    }

    const [rows] = await db.query(
      `SELECT c.compraId, c.usuarioId, c.anuncioId, c.data_compra,
              a.nome AS nomeAnuncio, a.preco AS precoAnuncio, a.foto AS fotoAnuncio, a.descricao AS descricaoAnuncio
       FROM compras c
       JOIN anuncio a ON c.anuncioId = a.anuncioId
       WHERE c.usuarioId = ?
       ORDER BY c.data_compra DESC`,
      [usuarioId]
    );

    console.log("minhascompras -> usuarioId:", usuarioId, "rows:", rows.length);

    res.json({ compras: rows });
  } catch (err) {
    console.error("Erro /minhascompras:", err);
    res.status(500).json({ error: "Erro ao buscar compras" });
  }
});

export default app;