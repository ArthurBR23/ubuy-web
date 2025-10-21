const { text } = require('body-parser');
const ComentarioModel = require('../models/chat.js');

const ComentarioService = {
    getChatHistory: async (candidato_vaga_id) => {
        return ComentarioModel.getMessageByCandidato(candidato_vaga_id);
    },

    createMessage: async ({ candidato_vaga_id, texto_comentario, usuario_comentou_id }) => {
        return ComentarioModel.insertMessage(candidato_vaga_id, texto_comentario, usuario_comentou_id);
    },

    deleteMessage: async (comentario_id, usuario_id) => {
        return ComentarioModel.deleteMessage(comentario_id, usuario_id);
    },
     getCandidatoEVaga: async (candidato_vaga_id) => {
        return await ComentarioModel.getCandidatoEVaga(candidato_vaga_id);
    },

}

module.exports = ComentarioService;