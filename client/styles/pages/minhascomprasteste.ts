import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import imagem from '../assets/pexels-rdne-7092358.jpg'

const MinhasCompras = () => {
  const [compraSelecionada, setCompraSelecionada] = useState(null)

  const compras = [
    {
      id: 1,
      preco: "R$25,00",
      nome: "Livros bisbisbis",
      localizacao: "Bairro, Cidade",
      descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
    },
    {
      id: 2,
      preco: "R$45,00",
      nome: "Tablet Samsung",
      localizacao: "Centro, Cidade",
      descricao: "Tablet em perfeito estado, pouco uso. Acompanha capa e carregador."
    },
    {
      id: 3,
      preco: "R$80,00",
      nome: "Tênis Nike Air Max",
      localizacao: "Vila, Cidade",
      descricao: "Tênis usado por 2 meses, em ótimo estado de conservação."
    }
  ]

  return (
    <div className='minhas-compras-page'>
      <Navbar />
      <div className="container">
        <div className="compras-header">
          <h1>Minhas compras</h1>
        </div>

        <div className="compras-list">
          {compras.map((compra) => (
            <div key={compra.id} className="compra-card">
              <div className="compra-header">
                <div className="compra-imagem">
                  <img src={imagem} alt={compra.nome} />
                </div>
                <div className="compra-info-top">
                  <span className="compra-preco">{compra.preco}</span>
                  <strong className="compra-nome">{compra.nome}</strong>
                  <span className="compra-localizacao">{compra.localizacao}</span>
                </div>

                {/* Botão Olho */}
                <button 
                  className="btn-visualizar" 
                  onClick={() => setCompraSelecionada(compra)}
                  title="Ver especificações"
                >
                  👁️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de visualização */}
      {compraSelecionada && (
        <div className="modal-overlay" onClick={() => setCompraSelecionada(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{compraSelecionada.nome}</h2>
            <img src={imagem} alt={compraSelecionada.nome} />
            <p><strong>Preço:</strong> {compraSelecionada.preco}</p>
            <p><strong>Localização:</strong> {compraSelecionada.localizacao}</p>
            <p><strong>Descrição:</strong> {compraSelecionada.descricao}</p>
            
            <button className="btn-fechar" onClick={() => setCompraSelecionada(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MinhasCompras


@use "sass:color";

$font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

// COLORS
$azul-logo: #1830B2;
$azul-light-logo: #B6DBFA;
$gray: #d9d9d9;
$background-comp: #e4e4e4;
$shadow-component: #424242;
$font: #F4F3F2;
$font-secondary: #e0e0e0;
$hr-color: #444444;

// UTILS
$radius: 8px;

.minhas-compras-page {
  min-height: 100vh;
  background-color: #fff;

  .container {
    padding: 2rem;
    max-width: 90%;
    margin: 0 auto;
  }

  .compras-header {
    margin-bottom: 2rem;

    h1 {
      color: $shadow-component;
      font-size: 2rem;
      margin: 0;
      font-weight: bold;
    }
  }

  .compras-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    height: 80vh;
    overflow-x: auto;
    gap: 2rem;
  }

  .compra-card {
    background-color: white;
    max-width: 45%;
    border: 1px solid $gray;
    border-radius: $radius;
    padding: 1.5rem;
    position: relative;

    .compra-header {
      display: flex;
      gap: 10px;
      align-items: flex-start;

      .compra-info-top {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .compra-preco {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .compra-nome {
          font-size: 1.2rem;
          color: $shadow-component;
        }

        .compra-localizacao {
          font-size: 0.9rem;
          color: $hr-color;
        }
      }

      .btn-visualizar {
        margin-left: auto;
        background: none;
        border: none;
        font-size: 1.3rem;
        cursor: pointer;
        transition: transform 0.2s ease, color 0.2s ease;
        color: $shadow-component;

        &:hover {
          transform: scale(1.2);
          color: $azul-logo;
        }
      }
    }

    .compra-imagem {
      width: 150px;
      height: 150px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 6px;
        background-color: $background-comp;
      }
    }

    .compra-content-row {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .compra-descricao {
      flex: 1;

      h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: $shadow-component;
        margin-top: 0;
        margin-bottom: 0.4rem;
      }

      p {
        font-size: 0.95rem;
        line-height: 1.5;
        color: $hr-color;
        margin: 0;
      }
    }
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: #fff;
    padding: 2rem;
    border-radius: $radius;
    max-width: 600px;
    width: 90%;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    text-align: center;
    animation: fadeIn 0.3s ease-in-out;

    h2 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: $shadow-component;
    }

    img {
      width: 100%;
      max-height: 250px;
      object-fit: cover;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    p {
      margin: 0.5rem 0;
      font-size: 1rem;
      color: $hr-color;
    }

    .btn-fechar {
      margin-top: 1rem;
      padding: 0.6rem 1.2rem;
      background-color: $azul-logo;
      border: none;
      border-radius: $radius;
      color: $font;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background-color: color.scale($azul-logo, $lightness: -10%);
      }
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
}

@media (max-width: 768px) {
  .minhas-compras-page {
    .container {
      padding: 1rem;
    }

    .compra-content-row {
      flex-direction: column;
    }

    .compra-imagem {
      width: 100%;
      height: 200px;
    }
  }
}
