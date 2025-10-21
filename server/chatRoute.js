const express = require('express');
const router = express.Router();
const ComentarioController = require('../controllers/chat');
const authMiddleware = require('../middlewares/auth');

// histórico
router.get('/chat_history/:candidato_vaga_id', ComentarioController.getChatHistory);

// nova mensagem
router.post('/new_msg', ComentarioController.newMessage)

// apagar mensagem (PATCH para marcar apagada)
router.patch('/delete/:comentario_id', ComentarioController.deleteMessage);

module.exports = router;