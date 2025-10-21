import React, { useState } from 'react';
import { FaHeart } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const AnuncioFavorito = ({ anuncio, onRemover }) => {
  const [isFavorito, setIsFavorito] = useState(true);
  const navigate = useNavigate();

  // Verifica se o usuário está logado (exemplo: tem token salvo)
  const isLoggedIn = !!localStorage.getItem('token');

  const toggleFavorito = (e) => {
    e.stopPropagation();
    setIsFavorito(false);
    setTimeout(() => {
      onRemover();
    }, 200);
  };

  const irParaAnuncio = () => {
    navigate(`/anuncio/${anuncio.id}`);
  };

  // Normalize foto URL: if it's just a filename, prefix with uploads URL
  const fotoSrc = anuncio?.foto
    ? String(anuncio.foto).startsWith('http')
      ? anuncio.foto
      : `http://localhost:3000/uploads/${anuncio.foto}`
    : null;

  return (
    <div className='anuncio-card' onClick={irParaAnuncio}>
      <div className="card-image">
        {fotoSrc ? (
          <img
            className='img-anuncio'
            src={fotoSrc}
            alt={anuncio.nome}
            onError={(e) => {
              e.target.style.display = 'none';
              const placeholder = e.target.parentNode.querySelector('.image-placeholder');
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span>Sem imagem</span>
          </div>
        )}

        {/* Só mostra o botão se o usuário estiver logado */}
        {isLoggedIn && (
          <button 
            className={`favorite-btn favoritado`}
            onClick={toggleFavorito}
            aria-label="Remover dos favoritos"
          >
            <FaHeart />
          </button>
        )}
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{anuncio.nome}</h3>
        <div className="card-price">R$ {parseFloat(anuncio.preco).toFixed(2)}</div>
        <div className="card-footer">
          <span className={`condition-badge ${anuncio.condicao?.toLowerCase() || 'usado'}`}>
            {anuncio.condicao || 'Usado'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnuncioFavorito;
