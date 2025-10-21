import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const AnuncioDetalhes = () => {
  const { anuncioId } = useParams();
  const [anuncio, setAnuncio] = useState({ fotos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotoAtual, setFotoAtual] = useState(null);

  useEffect(() => {
    const fetchAnuncio = async () => {
      try {
        console.log("Buscando anúncioId:", anuncioId);
          const res = await fetch(`http://localhost:3000/anuncio/detalhes/${anuncioId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Anúncio não encontrado");
          throw new Error(`Erro ao buscar anúncio: ${res.status}`);
        }
        const data = await res.json();
        console.log("Dados recebidos do backend:", data);
        if (!data) throw new Error("Anúncio não encontrado");
        setAnuncio(data);
        setFotoAtual(data.foto || null);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnuncio();
  }, [anuncioId]);

  if (loading) return <p>Carregando anúncio...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", padding: "15px", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h1>{anuncio.nome}</h1>

      <img
        src={fotoAtual ? `http://localhost:3000/uploads/${fotoAtual}` : "/placeholder.jpg"}
        alt={anuncio.nome}
        style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "6px" }}
      />

      {anuncio.fotos && anuncio.fotos.length > 1 && (
        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
          {anuncio.fotos.map((f, i) => (
            <img
              key={i}
              src={`http://localhost:3000/uploads/${f}`}
              alt={`Miniatura ${i + 1}`}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "4px",
                border: f === fotoAtual ? "2px solid #007bff" : "1px solid #ccc",
                cursor: "pointer"
              }}
              onClick={() => setFotoAtual(f)}
            />
          ))}
        </div>
      )}

      <p style={{ marginTop: "15px" }}>{anuncio.descricao}</p>
      <p><strong>Curso:</strong> {anuncio.curso}</p>
      <p><strong>Preço:</strong> R$ {anuncio.preco}</p>
      <p>
        <strong>Vendedor:</strong> <Link to={`/perfil2/${anuncio.usuarioId}`}>{anuncio.usuarioNome}</Link>
      </p>
      <Link
        to={`/chat/${anuncio.usuarioId}`}
        style={{ display: "inline-block", marginTop: "10px", padding: "6px 12px", backgroundColor: "#007bff", color: "#fff", borderRadius: "4px", textDecoration: "none" }}
      >
        Contatar vendedor
      </Link>
    </div>
  );
};

export default AnuncioDetalhes;
