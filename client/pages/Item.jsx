import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { IoIosArrowBack } from "react-icons/io";
import { FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import { IoBag, IoChatbox } from "react-icons/io5";
import { useNavigate, useParams, Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";


const Item = () => {
  const { anuncioId } = useParams();
  const navigate = useNavigate();

  const [anuncio, setAnuncio] = useState({ fotos: [] });
  const [usuario, setUsuario] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotoAtual, setFotoAtual] = useState(null);
  const [heart, setHeart] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixImageBase64, setPixImageBase64] = useState(null);
  const [pixPayload, setPixPayload] = useState(null);
  const [gerandoPix, setGerandoPix] = useState(false);
  const [pixErro, setPixErro] = useState(null);
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

        const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
        const jaFavoritado = favoritos.some(fav => fav.id === dataAnuncio.anuncioId);
        setHeart(jaFavoritado);

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

  console.log(usuario)

  const toggleFavorito = () => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    if (heart) {
      const novos = favoritos.filter(fav => fav.id !== anuncio.anuncioId);
      localStorage.setItem("favoritos", JSON.stringify(novos));
      setHeart(false);
    } else {
      const novo = {
        id: anuncio.anuncioId,
        nome: anuncio.nome,
        preco: anuncio.preco,
        descricao: anuncio.descricao,
        foto: anuncio.foto,
      };
      favoritos.push(novo);
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
      setHeart(true);
    }
  };

  const handleGerarPix = async () => {
  setPixErro(null);
  setGerandoPix(true);
  setPixImageBase64(null);
  setPixPayload(null);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setPixErro("Usuário não logado.");
      setGerandoPix(false);
      setShowPixModal(true);
      return;
    }

    const usuarioLogado = jwtDecode(token);
    const idComprador = usuarioLogado.usuarioId;

    if (!usuario.pix) {
      setPixErro("Anunciante não possui chave Pix cadastrada.");
      setGerandoPix(false);
      setShowPixModal(true);
      return;
    }

    const body = {
      valor: Number(anuncio.preco),
      chavePix: usuario.pix,           
      descricao: anuncio.nome || "Compra Ubuy",
      anuncioId: anuncio.anuncioId,
      idComprador,                     
    };

    console.log("Body Pix:", body);

    const res = await fetch("http://localhost:3000/anuncio/gerarpix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao gerar Pix: ${res.status} ${text}`);
    }

    const data = await res.json();
    setPixImageBase64(data.imagemBase64 || null);
    setPixPayload(data.payload || null);
    setShowPixModal(true);

  } catch (err) {
    console.error(err);
    setPixErro(err.message);
    setShowPixModal(true);
  } finally {
    setGerandoPix(false);
  }
};

  const copiarPayload = async () => {
    if (!pixPayload) return;
    try {
      await navigator.clipboard.writeText(pixPayload);
      Swal.fire("Código Pix copiado para área de transferência.");
    } catch {
      Swal.fire("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
    }
  };

  const mediaAvaliacoes =
    avaliacoes.length > 0
      ? (avaliacoes.reduce((acc, a) => acc + (a.nota || 0), 0) / avaliacoes.length).toFixed(1)
      : 0;


  if (loading) return <p>Carregando anúncio...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="Item-page">
      <Navbar />
      <div className="container">
        <header onClick={() => navigate("/home")}>
          <IoIosArrowBack /> Voltar para página inicial
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
              {heart ? (
                <FaHeart className="heart-full-icon" onClick={toggleFavorito} color="red" />
              ) : (
                <FaRegHeart className="heart-icon" onClick={toggleFavorito} />
              )}
            </div>

            <div className="preco">R${anuncio.preco}</div>

            <div className="description">
              <span className="title-description">Descrição</span>
              <span className="info-description">{anuncio.descricao}</span>
            </div>

            <div className="row">
              <div className="buttons">
                <button onClick={handleGerarPix} disabled={gerandoPix}>
                  <IoBag className="bag-icon" /> {gerandoPix ? "Gerando..." : "Comprar"}
                </button>
                <Link to="/chat" state={{ seller: { id: anuncio.usuarioId, name: anuncio.usuarioNome, fotoPerfil: anuncio.foto } }}>
                  <button>
                    <IoChatbox className="chat-icon" /> Chat
                  </button>
                </Link>
              </div>

              <div className="anunciante">
                <span className="title-anun">Anunciante</span>
                <div className="anun-content">
                  <div className="anun">
                    <div className="nome-anun">
                      <span className="nome">{anuncio.usuarioNome}</span>
                        <div className="estrelas">
                          <FaStar className="star-icon" />
                          <span className="nota">{anuncio.mediaAvaliacoes ?? 0}</span>
                          <span className="quant-nota">({anuncio.totalAvaliacoes ?? 0})</span>
                        </div>
                    </div>
                    <div className="anun-info">
                      <span>
                        Na Ubuy desde{" "}
                        {anuncio.dataCadastro
                          ? new Date(anuncio.dataCadastro).toLocaleDateString("pt-BR")
                          : "desconhecido"}
                      </span>
                      <span>Da faculdade {anuncio.instituicao || "não informado"}</span>
                      <span>Do curso {anuncio.curso || "não informado"}</span>
                    </div>

                    <footer>
                      <Link to={`/perfil2/${anuncio.usuarioId}`}>Ver perfil completo</Link>
                    </footer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPixModal && (
  <div className="pix-modal-overlay">
    <div className="pix-modal">
      <button className="x-btn" onClick={() => setShowPixModal(false)}>×</button>
      
      <h3>Pagamento via Pix</h3>

      {gerandoPix && <p>Gerando QR Code...</p>}
      {pixErro && <p className="pix-error">{pixErro}</p>}

      {pixImageBase64 ? (
        <div className="pix-content">
          <img
            src={pixImageBase64.startsWith("data:") ? pixImageBase64 : `data:image/png;base64,${pixImageBase64}`}
            alt="QR Pix"
          />
          <button onClick={copiarPayload}>Copiar código Pix</button>
          {pixPayload && (
            <details>
              <summary>Código Pix (payload)</summary>
              <textarea readOnly value={pixPayload} />
            </details>
          )}
        </div>
      ) : (
        !gerandoPix && !pixErro && <p>Nenhum QR gerado.</p>
      )}
    </div>
  </div>
)}
    </div>
  );
};

export default Item;
