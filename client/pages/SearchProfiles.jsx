import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const SearchProfiles = () => {
  const [results, setResults] = useState({ usuarios: [], anuncios: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const curso = searchParams.get("curso") || "";

  /* useEffect(() => {
    const buscar = async () => {
      if (!query && !curso) return; 

      setLoading(true);
      setError(null);

      try {
        const url = new URL("http://localhost:3000/search");
        if (query) url.searchParams.append("q", query);
        if (curso) url.searchParams.append("curso", curso);

        const res = await fetch(url);
        const data = await res.json();

        setResults({
          usuarios: data.usuarios || [],
          anuncios: data.anuncios || [],
        });
      } catch (err) {
        console.error(err);
        setError("Erro ao buscar resultados.");
        setResults({ usuarios: [], anuncios: [] });
      } finally {
        setLoading(false);
      }
    };
    buscar();
  }, [query, curso]); */

  useEffect(() => {
  const buscar = async () => {
    if (!query && !curso) return; 

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token'); // Pega o token
      
      const url = new URL("http://localhost:3000/search");
      if (query) url.searchParams.append("q", query);
      if (curso) url.searchParams.append("curso", curso);

      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Se o usuário estiver logado, envia o token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();

      setResults({
        usuarios: data.usuarios || [],
        anuncios: data.anuncios || [],
      });
    } catch (err) {
      console.error(err);
      setError("Erro ao buscar resultados.");
      setResults({ usuarios: [], anuncios: [] });
    } finally {
      setLoading(false);
    }
  };
  buscar();
}, [query, curso]);

  const totalResults = results.usuarios.length + results.anuncios.length;

  // ... imports e estado permanecem iguais ...

return (
  <div className="search-page">
    <Navbar />
    <div className="search-profiles-page">
      <h1>Resultados da Busca</h1>

      {/* Informações da busca */}
      {(query || curso) && (
        <div className="search-info">
          <p>
            <strong>Termo buscado:</strong> {query || "Nenhum"}
          </p>
          <p>
            <strong>Curso filtrado:</strong> {curso || "Nenhum"}
          </p>
          <p>
            <strong>Total de resultados:</strong> {totalResults}
          </p>
        </div>
      )}

      {loading && <p className="loading">Buscando resultados...</p>}
      {error && <p className="error">{error}</p>}

      {/* Seção de Usuários */}
      <h2>Usuários ({results.usuarios.length})</h2>
      {results.usuarios.length > 0 ? (
        <div className="result-grid user-results">
          {results.usuarios.map(u => (
            <Link key={u.usuarioId} to={`/perfil2/${u.usuarioId}`} className="result-item">
              <div className="user-avatar">
                <img
                  src={u.fotoPerfil ? `http://localhost:3000/uploads/${u.fotoPerfil}` : "/placeholder.jpg"}
                  alt={u.nome}
                  onError={(e) => {
                    e.target.src = "/placeholder.jpg";
                  }}
                />
              </div>
              <div className="user-info">
                <span>{u.nome}</span>
                <div className="user-details">
                  <div className="cidade">{u.cidade || "Cidade não informada"}</div>
                  {u.curso && <span className="curso">{u.curso}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !loading && <p className="no-results">Nenhum usuário encontrado</p>
      )}

      {/* Seção de Anúncios */}
      <h2>Anúncios ({results.anuncios.length})</h2>
      {results.anuncios.length > 0 ? (
        <div className="result-grid anuncio-results">
          {results.anuncios.map(a => (
            <Link key={a.anuncioId} to={`/anuncio/${a.anuncioId}`} className="result-item">
              <div className="anuncio-image">
                <img
                  src={a.foto ? `http://localhost:3000/uploads/${a.foto}` : "/placeholder.jpg"}
                  alt={a.nome}
                  onError={(e) => {
                    e.target.src = "/placeholder.jpg";
                  }}
                />
              </div>
              <div className="anuncio-info">
                <div className="anuncio-header">
                  <h3>{a.nome}</h3>
                  <div className="anuncio-price">R$ {parseFloat(a.preco).toFixed(2)}</div>
                </div>
                <div className="anuncio-details">
                  <div className="vendedor">
                    Por: <span>{a.usuarioNome}</span>
                  </div>
                  {a.usuarioCurso && (
                    <div className="curso">{a.usuarioCurso}</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !loading && <p className="no-results">Nenhum anúncio encontrado</p>
      )}
    </div>
  </div>
);
};

export default SearchProfiles;