import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const Anuncio = ({ anuncioId, nome, condicao, preco, foto, usuarioId, usuarioNome }) => {
  const [favoritado, setFavoritado] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // garante que a verificação terminou
  const navigate = useNavigate();

  // Verifica login
  useEffect(() => {
    // Tenta token em localStorage primeiro, depois em cookie (nome 'token')
    let token = localStorage.getItem('token');
    if (!token) {
      const m = document.cookie.match("(^|;)\\s*token=([^;]+)");
      token = m ? m[2] : null;
    }
    console.log("🔍 Token encontrado (localStorage/cookie):", token);
    const logged = token && token !== "null" && token !== "undefined";
    setIsLoggedIn(logged);
    setIsChecked(true);
  }, []);

  // Verifica se o anúncio já está favoritado
  useEffect(() => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    setFavoritado(favoritos.some(fav => fav.id === anuncioId));
  }, [anuncioId]);

  const toggleFavorito = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if (favoritado) {
      const novos = favoritos.filter(fav => fav.id !== anuncioId);
      localStorage.setItem("favoritos", JSON.stringify(novos));
      setFavoritado(false);
    } else {
      const novoAnuncio = { id: anuncioId, nome, condicao, preco, foto };
      favoritos.push(novoAnuncio);
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
      setFavoritado(true);
    }
  };

  // Enquanto não verificar o login, não mostra nada (evita piscar)
  if (!isChecked) return null;

  return (
    <Link to={`/anuncio/${anuncioId}`} className="anuncio-link">
      <div className='anuncio-card'>
        <div className="card-image">
          {foto ? (
            <img className='img-anuncio' src={foto} alt={nome} />
          ) : (
            <div className="image-placeholder">
              <span>Sem imagem</span>
            </div>
          )}

          {/* Só aparece se o usuário estiver logado */}
          {isLoggedIn && (
            <button 
              className={`favorite-btn ${favoritado ? 'favoritado' : ''}`}
              onClick={toggleFavorito}
              aria-label={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {favoritado ? <FaHeart /> : <FaRegHeart />}
            </button>
          )}
        </div>
        
        <div className="card-content">
          <h3 className="card-title">{nome}</h3>
          <div className="card-price">R$ {parseFloat(preco).toFixed(2)}</div>
          <div className="card-footer">
            <span className={`condition-badge ${condicao?.toLowerCase()}`}>
              {condicao || 'Usado'}
            </span>
            {isLoggedIn && usuarioId && (
              <button
                className="chat-btn"
                onClick={(e) => {
                  // Evita que o Link pai navegue para detalhes
                  e.preventDefault();
                  e.stopPropagation();
                  // Salva temporariamente no localStorage como fallback (será limpo pelo Chats.jsx após uso)
                  try {
                    localStorage.setItem('openChatWith', JSON.stringify({ id: usuarioId, name: usuarioNome, fotoPerfil: null }));
                  } catch (e) {
                    console.warn('Não foi possível salvar openChatWith no localStorage', e);
                  }
                  // Navega incluindo sellerId na query para fallback adicional
                  const url = `/chat?sellerId=${encodeURIComponent(usuarioId)}`;
                  console.debug('Navegando para', url, 'com state seller');
                  navigate(url, { state: { seller: { id: usuarioId, name: usuarioNome, fotoPerfil: null } } });
                }}
              >
                Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Anuncio;
