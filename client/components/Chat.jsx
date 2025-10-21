import React, { useState, useEffect, useRef } from 'react';
import { IoIosSend } from 'react-icons/io';
import { IoCamera } from "react-icons/io5";
import { FaTrash } from 'react-icons/fa';
import { timeAgo } from '../utils/Format';
import { DeleteMessageModal } from '../utils/Delete';

const Chat = ({ ws, isOpen, candidato_vaga_id, useMock = false, mockMessages = [] }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const endOfMessagesRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [msgToDelete, setMsgToDelete] = useState(null);

  const fetchChat = async () => {
    if (useMock) {
      setUsuarioId(1);
      setMessages(mockMessages);
      return;
    }

    try {
      const response = await fetch(
        `http://${window.location.hostname}:3578/api/comentarios/chat_history/${candidato_vaga_id}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Histórico não encontrado');
      const data = await response.json();
      setUsuarioId(data.usuarioLogadoId);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (useMock) {
      const fakeMsg = {
        comentario_id: `msg_${Date.now()}`,
        usuario_comentou_id: 1,
        author_name: 'Você',
        texto_comentario: newMessage,
        data_hora_comentario: new Date().toISOString(),
        apagado: false,
      };
      setMessages((prev) => [...prev, fakeMsg]);
      setNewMessage('');
      return;
    }

    try {
      const response = await fetch(
        `http://${window.location.hostname}:3578/api/comentarios/new_msg`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ candidato_vaga_id, texto_comentario: newMessage }),
        }
      );
      if (!response.ok) throw new Error('Erro ao enviar mensagem');
      setNewMessage('');
      fetchChat();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (useMock) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.comentario_id === msgToDelete ? { ...msg, apagado: true } : msg
        )
      );
      setModalOpen(false);
      setMsgToDelete(null);
      return;
    }

    try {
      const response = await fetch(
        `http://${window.location.hostname}:3578/api/comentarios/delete/${msgToDelete}`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Erro ao apagar mensagem');
      setModalOpen(false);
      setMsgToDelete(null);
      fetchChat();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchChat();
  }, [candidato_vaga_id]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!ws || useMock) return;

    ws.emit('joinRoom', candidato_vaga_id);
    ws.on('newMsg', fetchChat);
    return () => ws.off('newMsg');
  }, [ws, candidato_vaga_id]);

  return (
    <>
      <div className="chat-container" style={{ display: isOpen ? 'flex' : 'none' }}>
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Inicie uma conversa 😉</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.comentario_id}
                className={`message ${
                  msg.usuario_comentou_id === usuarioId ? 'sent' : 'received'
                }`}
              >
                <div className="message-header">
                  <span className="sender">
                    {msg.usuario_comentou_id === usuarioId
                      ? 'Você'
                      : msg.author_name || 'Autor desconhecido'}
                  </span>
                  <span className="timestamp">
                    {timeAgo(msg.data_hora_comentario)}
                  </span>
                </div>
                <div className="message-text">
                  {msg.apagado ? (
                    <i>[mensagem apagada]</i>
                  ) : (
                    <>
                      {msg.texto_comentario}
                      {msg.usuario_comentou_id === usuarioId && (
                        <button
                          className="delete-btn"
                          onClick={() => {
                            setMsgToDelete(msg.comentario_id);
                            setModalOpen(true);
                          }}
                          title="Apagar mensagem"
                          aria-label="Apagar mensagem"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <IoCamera className='camera-icon'/>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
          />
          <button type="submit">
            <IoIosSend className='send-icon'/>
          </button>
        </form>
      </div>

      {modalOpen && (
        <DeleteMessageModal
          onClose={() => setModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default Chat;


//fica assim para colocar//
// <div className="chat">
//          <h2>Comentários</h2>
//          <Chat
 //           ws={null}
//isOpen={true}
  //          candidato_vaga_id={candidato_vaga_id}
   //       />
   //     </div>