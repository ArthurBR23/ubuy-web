import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import Swal from "sweetalert2";

const ReviewForm = ({ usuarioAvaliadoId, onAvaliacaoCriada }) => {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Você precisa estar logado para enviar uma avaliação.");
      setEnviando(false);
      return;
    }

    const usuarioLogado = JSON.parse(localStorage.getItem("usuario")); 
    const avaliadorId = usuarioLogado?.usuarioId;

    if (nota < 1 || nota > 5) {
      Swal.fire("Selecione uma nota entre 1 e 5.");
      setEnviando(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/usuario/${usuarioAvaliadoId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          avaliadorId,
          usuarioAvaliadoId,
          nota,
          comentario
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Você já avaliou este usuário") {
          Swal.fire("Você já deixou uma avaliação para este usuário.");
        } else {
          alert(data.error || "Erro ao enviar avaliação.");
        }
        setEnviando(false);
        return;
      }

      onAvaliacaoCriada(data.avaliacao);
      setNota(0);
      setComentario("");
      Swal.fire("Avaliação enviada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar avaliação");
    } finally {
      setEnviando(false);
    }
  };

  // Versão com estrelas (opcional - descomente para usar)
  const renderEstrelas = () => {
    return (
      <div className="estrelas">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <FaStar
            key={estrela}
            className={`estrela ${estrela <= nota ? 'ativa' : ''}`}
            onClick={() => setNota(estrela)}
          />
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={enviar} className="review-form">
      <h3>Deixe sua avaliação</h3>

      <label>
        Nota:
        {/* Versão com select (padrão) */}
        <select 
          value={nota} 
          onChange={e => setNota(Number(e.target.value))}
          disabled={enviando}
        >
          <option value={0}>Selecione uma nota</option>
          <option value={1}>⭐ 1 - Muito ruim</option>
          <option value={2}>⭐⭐ 2 - Ruim</option>
          <option value={3}>⭐⭐⭐ 3 - Regular</option>
          <option value={4}>⭐⭐⭐⭐ 4 - Bom</option>
          <option value={5}>⭐⭐⭐⭐⭐ 5 - Excelente</option>
        </select>

        {/* Versão com estrelas (opcional) - descomente a linha abaixo */}
        {/* {renderEstrelas()} */}
      </label>

      <label>
        Comentário:
        <textarea 
          value={comentario} 
          onChange={e => setComentario(e.target.value)} 
          placeholder="Compartilhe sua experiência com este usuário..."
          disabled={enviando}
          maxLength={500}
        />
        <small style={{ color: '#666', fontSize: '0.8rem', display: 'block', textAlign: 'right' }}>
          {comentario.length}/500 caracteres
        </small>
      </label>

      <button type="submit" disabled={enviando || nota === 0}>
        {enviando ? "Enviando..." : "Enviar Avaliação"}
      </button>
    </form>
  );
};

export default ReviewForm;