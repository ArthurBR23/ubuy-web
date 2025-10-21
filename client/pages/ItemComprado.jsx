import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { IoIosArrowBack } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";

const ItemComprado = () => {
  const { anuncioId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Recebe a data da compra do state da navegação
  const dataCompra = location.state?.dataCompra;

  const [anuncio, setAnuncio] = useState({ fotos: [] });
  const [usuario, setUsuario] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotoAtual, setFotoAtual] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);

  useEffect(() => {
    const fetchAnuncioEUsuario = async () => {
      try {
        setLoading(true);
        setError(null);

        const resAnuncio = await fetch(`http://localhost:3000/anuncio/detalhes/${anuncioId}`);
        if (!resAnuncio.ok) {
          if (resAnuncio.status === 404) throw new Error("Anúncio não encontrado");
          throw new Error(`Erro ao buscar anúncio: ${resAnuncio.status}`);
        }
        const dataAnuncio = await resAnuncio.json();
        setAnuncio(dataAnuncio);
        setFotoAtual(dataAnuncio.foto || null);

        if (dataAnuncio.usuarioId) {
          const resUser = await fetch(`http://localhost:3000/usuario/${dataAnuncio.usuarioId}`);
          if (resUser.ok) {
            const userData = await resUser.json();
            setAvaliacoes(userData.avaliacoes || []);
            setUsuario(userData.usuario || userData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnuncioEUsuario();
  }, [anuncioId]);

  const formatarDataCompra = (dataString) => {
    if (!dataString) return "Data não informada";
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const mediaAvaliacoes =
    avaliacoes.length > 0
      ? (avaliacoes.reduce((acc, a) => acc + (a.nota || 0), 0) / avaliacoes.length).toFixed(1)
      : 0;

  if (loading) return (
    <div className="Item-page">
      <Navbar />
      <div className="container">
        <p>Carregando detalhes do item comprado...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="Item-page">
      <Navbar />
      <div className="container">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="Item-page">
      <Navbar />
      <div className="container">
        <header onClick={() => navigate("/minhascompras")} style={{cursor: 'pointer'}}>
          <IoIosArrowBack /> Voltar para minhas compras
        </header>

        <div className="content">
          <div className="col">
            <div className="img">
              <img
                src={fotoAtual ? `http://localhost:3000/uploads/${fotoAtual}` : "/placeholder.jpg"}
                alt={anuncio.nome}
              />
            </div>
            {anuncio.fotos && anuncio.fotos.length > 1 && (
              <div className="thumbnails">
                {anuncio.fotos.map((f, i) => (
                  <img
                    key={i}
                    src={`http://localhost:3000/uploads/${f}`}
                    alt={`Miniatura ${i + 1}`}
                    className={f === fotoAtual ? 'active' : ''}
                    onClick={() => setFotoAtual(f)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="col">
            <div className="title">
              <span>{anuncio.nome}</span>
              <div className="status-comprado">
                <span className="badge-comprado">Comprado</span>
              </div>
            </div>

            <div className="preco">R$ {anuncio.preco}</div>

            <div className="description">
              <span className="title-description">Descrição</span>
              <span className="info-description">{anuncio.descricao}</span>
            </div>

            <div className="info-compra">
              <div className="info-item">
                <strong>Data da compra:</strong>
                <span>{formatarDataCompra(dataCompra)}</span>
              </div>
            </div>

            <div className="row">
              <div className="anunciante">
                <span className="title-anun">Vendedor</span>
                <div className="anun-content">
                  <div className="anun">
                    <div className="nome-anun">
                      <span className="nome">{anuncio.usuarioNome}</span>
                      <div className="estrelas">
                        <FaStar className="star-icon" />
                        <span className="nota">{mediaAvaliacoes || "0"}</span>
                        <span className="quant-nota">({usuario.avaliacoesCount || 0})</span>
                      </div>
                    </div>
                    <div className="anun-info">
                      <span>
                        Na Ubuy desde{" "}
                        {usuario.dataCadastro
                          ? new Date(usuario.dataCadastro).toLocaleDateString("pt-BR")
                          : "desconhecido"}
                      </span>
                      <span>Da faculdade {usuario.instituicao || "não informado"}</span>
                      <span>Do curso {usuario.curso || "não informado"}</span>
                    </div>
                    <footer>
                      <Link to={`/perfil2/${anuncio.usuarioId}`}>Ver perfil do vendedor</Link>
                    </footer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemComprado;