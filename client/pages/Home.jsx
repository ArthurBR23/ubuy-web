import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Anuncio from '../components/Anuncio';
import imagem from '../assets/pexels-rdne-7092358.jpg';

const Home = () => {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);

 /*  useEffect(() => {
    const fetchAnuncios = async () => {
      try {
        const token = localStorage.getItem('token'); // Pega o token
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Se o usuário estiver logado, envia o token
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://localhost:3000/anuncio/home', {
          headers
        });
        const data = await response.json();

        const anunciosAtivos = data.filter(
          (a) => a.status !== 'vendido' && a.status !== 'inativo'
        );

        setAnuncios(anunciosAtivos);
        
      } catch (error) {
        console.error('Erro ao buscar anúncios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnuncios();
  }, []); */

  useEffect(() => {
  const fetchAnuncios = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("🎫 Token do localStorage:", token ? "Existe" : "Não existe");
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log("✅ Enviando token no header");
      } else {
        console.log("⚠️ Nenhum token para enviar");
      }

      console.log("📤 Headers enviados:", headers);

      const response = await fetch('http://localhost:3000/anuncio/home', {
        headers
      });
      const data = await response.json();

      console.log("📥 Anúncios recebidos:", data.length);

      const anunciosAtivos = data.filter(
        (a) => a.status !== 'vendido' && a.status !== 'inativo'
      );

      setAnuncios(anunciosAtivos);
      
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchAnuncios();
}, []);

  return (
    <div className='Home-page'>
      <Navbar />
      <div className="container">
        <header className="imagem">
          <img src={imagem} alt="Estudantes universitários" />
          <div className="logo">
            <img src="../../client/assets/UbuyLogo3.svg" alt="Ubuy Logo"/>
            <span>Compra e venda universitária</span>
          </div>
        </header>

        <div className="content">
          {loading ? (
            <p className="loading">Carregando anúncios...</p>
          ) : anuncios.length > 0 ? (
            anuncios.map(anuncio => (
              <Anuncio 
                key={anuncio.anuncioId} 
                nome={anuncio.nome} 
                anuncioId={anuncio.anuncioId} 
                descricao={anuncio.descricao} 
                preco={anuncio.preco}
                condicao={anuncio.condicao} 
                foto={anuncio.foto ? `http://localhost:3000/uploads/${anuncio.foto}` : null}
                  usuarioId={anuncio.usuarioId}
                  usuarioNome={anuncio.usuarioNome}
              />
            ))
          ) : (
            <p>Nenhum anúncio encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;