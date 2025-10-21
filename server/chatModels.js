const db = require('../config/db');

const ComentarioModel = {
  getMessageByCandidato: (candidato_vaga_id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT c.*, u.nome AS author_name
            FROM comentarios c
            LEFT JOIN usuarios u ON u.usuario_id = c.usuario_comentou_id
            WHERE c.candidato_vaga_id = ?
            ORDER BY c.data_hora_comentario ASC`;

      db.query(sql, [candidato_vaga_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

   getCandidatoEVaga: (candidato_vaga_id) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          cv.candidato_id,
          cv.vaga_id,
          c.nome_completo   AS candidato_nome,
          v.titulo_vaga AS vaga_titulo
        FROM candidatovaga cv
        JOIN candidatos c ON c.candidato_id = cv.candidato_id
        JOIN vagas      v ON v.vaga_id      = cv.vaga_id
        WHERE cv.candidato_vaga_id = ?
        LIMIT 1
      `;
      db.query(sql, [candidato_vaga_id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || {});
      });
    });
  },

  insertMessage: (candidato_vaga_id, texto_comentario, usuario_comentou_id) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO comentarios (candidato_vaga_id, texto_comentario, usuario_comentou_id) 
        VALUES (?, ?, ?)`;

        
      db.query(sql, [candidato_vaga_id, texto_comentario, usuario_comentou_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    })
  },

  deleteMessage: (comentario_id, usuario_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE comentarios 
      SET apagado = 1 
      WHERE comentario_id = ? AND usuario_comentou_id = ?`;

    db.query(sql, [comentario_id, usuario_id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
},

};

module.exports = ComentarioModel;
