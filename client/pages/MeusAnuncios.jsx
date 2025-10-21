import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const MeusAnuncios = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const filtroInicial = urlParams.get("vendidos") ? "vendidos" : "publicados";
  const [filtroAtivo, setFiltroAtivo] = useState(filtroInicial);
  const [menuAberto, setMenuAberto] = useState(null);
  const [anuncios, setAnuncios] = useState([]);
  const [anuncioFotoIndex, setAnuncioFotoIndex] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 🟢 novo estado
  const navigate = useNavigate();

  const usuarioId = localStorage.getItem("usuarioId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !usuarioId) {
      setIsLoggedIn(false);
      return;
    }

    setIsLoggedIn(true);

    const fetchAnuncios = async () => {
      try {
        const res = await fetch(`http://localhost:3000/anuncio/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setAnuncios(data);

        const initIndex = {};
        data.forEach((_, idx) => {
          initIndex[idx] = 0;
        });
        setAnuncioFotoIndex(initIndex);
      } catch (err) {
        console.error("Erro ao carregar anúncios:", err);
      }
    };

    fetchAnuncios();
  }, [usuarioId, token]);

  // 🧱 se o usuário não estiver logado, mostra aviso e botão para login
  if (!isLoggedIn) {
    return (
      <div className="meus-anuncios-page">
        <Navbar />
        <div className="not-logged-container">
          <h2>Você precisa estar logado para ver seus anúncios 📦</h2>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  const toggleMenu = (index) => {
    setMenuAberto(menuAberto === index ? null : index);
  };

  const handleAcao = (acao, anuncioId, statusAtual) => {
    setMenuAberto(null);
    if (acao === "Editar") navigate(`/editaranuncio/${anuncioId}`);
    else if (acao === "Desativar") desativarAnuncio(anuncioId);
    else if (acao === "Ativar") ativarAnuncio(anuncioId);
    else if (acao === "Excluir") excluirAnuncio(anuncioId);
  };

  const desativarAnuncio = async (anuncioId) => {
    try {
      const res = await fetch(`http://localhost:3000/anuncio/${anuncioId}/desativar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erro ao desativar anúncio");
      setAnuncios((prev) =>
        prev.map((a) => (a.anuncioId === anuncioId ? { ...a, status: "inativo" } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const ativarAnuncio = async (anuncioId) => {
    try {
      const res = await fetch(`http://localhost:3000/anuncio/${anuncioId}/ativar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erro ao ativar anúncio");
      setAnuncios((prev) =>
        prev.map((a) => (a.anuncioId === anuncioId ? { ...a, status: "ativo" } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const excluirAnuncio = async (anuncioId) => {
    if (!window.confirm("Tem certeza que deseja excluir este anúncio?")) return;
    try {
      const res = await fetch(`http://localhost:3000/anuncio/${anuncioId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir anúncio");
      setAnuncios((prev) => prev.filter((a) => a.anuncioId !== anuncioId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextFoto = (anuncioIdx) => {
    const total = anuncios[anuncioIdx].fotos.length;
    setAnuncioFotoIndex((prev) => ({
      ...prev,
      [anuncioIdx]: (prev[anuncioIdx] + 1) % total,
    }));
  };

  const handlePrevFoto = (anuncioIdx) => {
    const total = anuncios[anuncioIdx].fotos.length;
    setAnuncioFotoIndex((prev) => ({
      ...prev,
      [anuncioIdx]: (prev[anuncioIdx] - 1 + total) % total,
    }));
  };

  const anunciosPorCategoria = {
    publicados: anuncios.filter((a) => a.status === "ativo"),
    vendidos: anuncios.filter((a) => a.status === "vendido"),
    inativos: anuncios.filter((a) => a.status === "inativo"),
  };

  const estatisticas = {
    publicados: anunciosPorCategoria.publicados.length,
    vendidos: anunciosPorCategoria.vendidos.length,
    inativos: anunciosPorCategoria.inativos.length,
  };

  const filtros = [
    { key: "publicados", label: "Publicados", count: estatisticas.publicados },
    { key: "vendidos", label: "Vendidos", count: estatisticas.vendidos },
    { key: "inativos", label: "Inativos", count: estatisticas.inativos },
  ];

  const anunciosFiltrados = anunciosPorCategoria[filtroAtivo] || [];

  const renderDropdownMenu = (anuncio, index) => {
    if (anuncio.status === "vendido") {
      return (
        <div className="dropdown-menu">
          <button
            className="dropdown-item excluir"
            onClick={() => handleAcao("Excluir", anuncio.anuncioId, anuncio.status)}
          >
            Excluir
          </button>
        </div>
      );
    }
    return (
      <div className="dropdown-menu">
        <button
          className="dropdown-item"
          onClick={() => handleAcao("Editar", anuncio.anuncioId, anuncio.status)}
        >
          Editar
        </button>
        {anuncio.status === "inativo" ? (
          <button
            className="dropdown-item"
            onClick={() => handleAcao("Ativar", anuncio.anuncioId, anuncio.status)}
          >
            Ativar
          </button>
        ) : (
          <button
            className="dropdown-item"
            onClick={() => handleAcao("Desativar", anuncio.anuncioId, anuncio.status)}
          >
            Desativar
          </button>
        )}
        <button
          className="dropdown-item excluir"
          onClick={() => handleAcao("Excluir", anuncio.anuncioId, anuncio.status)}
        >
          Excluir
        </button>
      </div>
    );
  };

  return (
    <div className="meus-anuncios-page">
      <Navbar />
      <div className="container">
        <div className="anuncios-header">
          <h1>Meus anúncios</h1>
          <button className="btn-criar-anuncio" onClick={() => navigate("/criaranuncio")}>
            + Criar novo anúncio
          </button>
        </div>

        <div className="layout-container">
          <div className="filtros-sidebar">
            <div className="filtros-list">
              {filtros.map((filtro) => (
                <button
                  key={filtro.key}
                  className={`filtro-item ${filtroAtivo === filtro.key ? "ativo" : ""}`}
                  onClick={() => setFiltroAtivo(filtro.key)}
                >
                  <span className="filtro-label">{filtro.label}</span>
                  <span className="filtro-numero">{filtro.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="anuncios-content">
            <div className="anuncios-scroll-container">
              {anunciosFiltrados.length > 0 ? (
                anunciosFiltrados.map((anuncio, index) => (
                  <div key={anuncio.anuncioId} className="anuncio-card">
                    <div className="anuncio-header">
                      <div className="anuncio-imagem-carrossel">
                        {anuncio.fotos && anuncio.fotos.length > 0 ? (
                          <>
                            {anuncio.fotos.length > 1 && (
                              <>
                                <button className="carrossel-btn prev" onClick={() => handlePrevFoto(index)}>‹</button>
                                <button className="carrossel-btn next" onClick={() => handleNextFoto(index)}>›</button>
                                <div className="carrossel-indicadores">
                                  {anuncio.fotos.map((_, i) => (
                                    <span
                                      key={i}
                                      className={`indicador ${i === anuncioFotoIndex[index] ? "ativo" : ""}`}
                                      onClick={() => setAnuncioFotoIndex((prev) => ({ ...prev, [index]: i }))}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                            <img
                              src={`http://localhost:3000/uploads/${anuncio.fotos[anuncioFotoIndex[index]]}`}
                              alt={anuncio.nome}
                            />
                          </>
                        ) : (
                          <div className="foto-placeholder">Sem imagem</div>
                        )}
                      </div>

                      <div className="anuncio-info-top">
                        <span className="anuncio-preco">R$ {anuncio.preco}</span>
                        <strong className="anuncio-nome">{anuncio.nome}</strong>
                        <span className="anuncio-localizacao">{anuncio.localizacao || "Não informado"}</span>
                      </div>

                      <div className="dropdown-menu-container">
                        <button className="menu-toggle" onClick={() => toggleMenu(index)}>⋮</button>
                        {menuAberto === index && renderDropdownMenu(anuncio, index)}
                      </div>
                    </div>

                    <div className="divider-interno"></div>

                    <div className="anuncio-content-row">
                      <div className="anuncio-descricao">
                        <h3>Descrição</h3>
                        <p>{anuncio.descricao}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sem-anuncios">
                  <p>Nenhum anúncio encontrado nesta categoria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeusAnuncios;
