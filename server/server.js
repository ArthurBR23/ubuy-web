import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import loginApp from './login.js';
import cadastroApp from './cadastro.js';
import senhaApp from './senha.js';
import logoutRoutes from './logout.js';
import usuarioApp from './usuario.js';
import anuncioApp from './novoanuncio.js';
import minhasComprasApp from './minhascompras.js';
import chatApp, { conversas } from './chat.js';
import jwt from 'jsonwebtoken';
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app); // 🔹 Usar server HTTP para Socket.IO

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(loginApp);
app.use(cadastroApp);
app.use(senhaApp);
app.use("/auth", logoutRoutes);
app.use(usuarioApp);
app.use(anuncioApp);
app.use(minhasComprasApp); 
app.use(chatApp);

// 🔹 Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // frontend dev servers
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
  },
  transports: ["websocket", "polling"]
});

// middleware to verify token for socket connections
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('Unauthorized'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.usuarioId = decoded.usuarioId;
    return next();
  } catch (err) {
    console.error('Socket auth error:', err.message);
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log('Novo cliente conectado (socket):', socket.id, 'usuarioId:', socket.usuarioId);
  socket.join(`user:${socket.usuarioId}`);

  socket.on('mensagem', (payload) => {
    try {
      const fromId = socket.usuarioId;
      const { to, text, hora } = payload;
      if (!to || !text) return;

      const convId = (a, b) => {
        const x = Number(a); const y = Number(b);
        return x < y ? `${x}-${y}` : `${y}-${x}`;
      };

      const id = convId(fromId, to);
      const msg = { from: fromId, to, text, hora: hora || new Date().toLocaleTimeString() };
      if (!conversas[id]) conversas[id] = [];
      conversas[id].push(msg);

      io.to(`user:${fromId}`).to(`user:${to}`).emit('mensagem', msg);
    } catch (err) {
      console.error('Erro ao processar mensagem (socket):', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket desconectado:', socket.id);
  });
});

// 🔹 Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
