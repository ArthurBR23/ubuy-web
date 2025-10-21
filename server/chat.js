import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import db from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conversas armazenadas em memória por par de usuários: { "min-max": [msgs] }
export const conversas = {};

function conversationId(a, b) {
  const x = Number(a);
  const y = Number(b);
  return x < y ? `${x}-${y}` : `${y}-${x}`;
}

// middleware para verificar token em rotas REST
function verifyTokenMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "Não autenticado" });
    const parts = auth.split(" ");
    if (parts.length !== 2) return res.status(401).json({ message: "Token inválido" });
    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = decoded.usuarioId;
    next();
  } catch (err) {
    console.error("Token inválido:", err.message);
    res.status(401).json({ message: "Token inválido" });
  }
}

// lista contatos (exclui usuário autenticado)
app.get("/contatos", verifyTokenMiddleware, async (req, res) => {
  try {
  const sql = "SELECT usuarioId, nome, fotoPerfil, cidade FROM usuario WHERE usuarioId <> ? AND status = 'ativo' LIMIT 100";
    const [rows] = await db.query(sql, [req.usuarioId]);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar contatos:", err);
    res.status(500).json({ message: "Erro ao buscar contatos" });
  }
});

// rota pública para listar contatos (sem exigir token) - útil para sidebar público
app.get("/contatos-publico", async (req, res) => {
  try {
  const sql = "SELECT usuarioId, nome, fotoPerfil, cidade FROM usuario WHERE status = 'ativo' LIMIT 100";
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar contatos públicos:", err);
    res.status(500).json({ message: "Erro ao buscar contatos públicos" });
  }
});

// retorna histórico entre usuário autenticado e outro usuário
app.get("/conversa/:usuarioId", verifyTokenMiddleware, (req, res) => {
  try {
    const otherId = Number(req.params.usuarioId);
    const convId = conversationId(req.usuarioId, otherId);
    const msgs = conversas[convId] || [];
    res.json(msgs);
  } catch (err) {
    console.error("Erro ao buscar conversa:", err);
    res.status(500).json({ message: "Erro ao buscar conversa" });
  }
});

// retorna lista de contatos que enviaram mensagens para o usuário autenticado
app.get("/contatos-com-mensagens", verifyTokenMiddleware, async (req, res) => {
  try {
    const myId = Number(req.usuarioId);
    const otherIds = new Set();

    // percorre as conversas em memória e encontra conversas onde o outro usuário enviou mensagens para mim
    for (const convId of Object.keys(conversas)) {
      const parts = convId.split("-").map((v) => Number(v));
      if (parts.length !== 2) continue;
      const [a, b] = parts;
      if (a !== myId && b !== myId) continue; // conversa não envolve este usuário
      const other = a === myId ? b : a;
      const msgs = conversas[convId] || [];
      if (msgs.some((m) => Number(m.from) === other)) otherIds.add(other);
    }

    if (otherIds.size === 0) return res.json([]);

    const idsArray = Array.from(otherIds);
    const placeholders = idsArray.map(() => "?").join(",");
    const sql = `SELECT usuarioId, nome, fotoPerfil, cidade FROM usuario WHERE usuarioId IN (${placeholders}) AND status = 'ativo' LIMIT 100`;
    const [rows] = await db.query(sql, idsArray);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar contatos com mensagens:", err);
    res.status(500).json({ message: "Erro ao listar contatos" });
  }
});

export default app;