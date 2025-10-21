import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AnuncioFavorito from '../components/AnuncioFavorito';

const Favorito = () => {
  const [favoritos, setFavoritos] = useState([]);

  const removerFavorito = (id) => {
    const favoritosSalvos = JSON.parse(localStorage.getItem("favoritos")) || [];
    const novos = favoritosSalvos.filter(fav => fav.id !== id);
    localStorage.setItem("favoritos", JSON.stringify(novos));
    setFavoritos(novos); 
  };

  useEffect(() => {
    const itensSalvos = JSON.parse(localStorage.getItem("favoritos")) || [];
    setFavoritos(itensSalvos);
  }, []);

  return (
    <div className='Favorito-page'>
      <Navbar />
      <div className="container">
        <div className="favoritos-header">
          <h1>Meus Favoritos</h1>
          <span className="favoritos-count">{favoritos.length} {favoritos.length === 1 ? 'item salvo' : 'itens salvos'}</span>
        </div>

        <div className="anuncios-grid">
          {favoritos.length > 0 ? (
            favoritos.map((anuncio, index) => (
              <AnuncioFavorito
                key={anuncio.id || index}
                anuncio={anuncio}
                onRemover={() => removerFavorito(anuncio.id)}
              />
            ))
          ) : (
            <div className="sem-favoritos">
              <p>Nenhum favorito ainda.</p>
              <span>Os anúncios que você curtir aparecerão aqui</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorito;