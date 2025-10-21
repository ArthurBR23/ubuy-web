const ComentarioService = require('../services/chat.js');
const AtividadeService  = require('../services/atividade.js');
const jwt = require('jsonwebtoken');

const ComentarioController = {
  getChatHistory: async (req, res) => {
    try {
    const { candidato_vaga_id } = req.params;

    let usuarioLogadoId = null;
    if (req.cookies.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        usuarioLogadoId = decoded.id;
      } catch (err) {
        console.error("Erro ao decodificar JWT:", err);
      }
    }

    const result = await ComentarioService.getChatHistory(candidato_vaga_id);

    res.status(200).json({
      usuarioLogadoId,
      messages: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  },

 
  newMessage: async (req, res) => {
    try {
      // 1) Valida JWT e extrai id + nome
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ error: 'Token JWT não fornecido' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario_id   = decoded.id;
      const usuario_nome = decoded.nome || null; // se não tiver no token, busque no DB!

      // 2) Dados do corpo
      const { candidato_vaga_id, texto_comentario } = req.body;

      // 3) Grava o comentário e captura o insertId
      const resultComentario = await ComentarioService.createMessage({
        candidato_vaga_id,
        texto_comentario,
        usuario_comentou_id: usuario_id,
      });
      const comentario_id = resultComentario.insertId;

      console.log('📝 Comentário criado, id=', comentario_id);

      // 4) Busca nome do candidato e título da vaga
      const { candidato_nome, vaga_titulo, candidato_id, vaga_id } =
        await ComentarioService.getCandidatoEVaga(candidato_vaga_id);

      // 5) Monta o payload da atividade
      const atividade = {
        usuario_id,
        usuario_nome,
        candidato_id,
        candidato_nome,
        vaga_id,
        vaga_titulo,
        acao: 'comment',
        metadata: { comentario_id }
      };
      console.log('📝 Preparando para registrar atividade:', atividade);

      // 6) Grava e emite a atividade
      const io = req.app.get('io');
      await AtividadeService.registrar(io, atividade);
      console.log('✅ Atividade registrada e emitida');

      // 7) Retorna OK ao cliente do Chat
      return res.status(201).json({ message: 'Mensagem enviada com sucesso', comentario_id });
    } catch (error) {
      console.error('Erro no newMessage:', error);
      return res.status(500).json({ error: error.message });
    }
  },

deleteMessage: async (req, res) => {
  try {
    const { comentario_id } = req.params;

    // Pega ID do usuário do token
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Token JWT não fornecido' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario_id = decoded.id;

    // Chama o service
    const result = await ComentarioService.deleteMessage(comentario_id, usuario_id);

    if (!result.affectedRows) {
      return res.status(403).json({ error: 'Sem permissão para apagar esta mensagem' });
    }

    res.status(200).json({ message: 'Mensagem apagada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},


};

 module.exports = ComentarioController;