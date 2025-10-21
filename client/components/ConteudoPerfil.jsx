import React from 'react'
import { Link } from 'react-router-dom'
import imagemPadrao from '../assets/pexels-rdne-7092358.jpg'

const ConteudoPerfil = ({ anuncios, avaliacoes, ehMeuPerfil = false }) => {
  
  const renderEstrelas = (nota) => {
    if (!nota) return "☆☆☆☆☆"
    return "★".repeat(Math.floor(nota)) + "☆".repeat(5 - Math.floor(nota))
  }
  
  const anunciosAtivos = anuncios?.filter(a => a.status === "ativo") || []

  // Função para determinar a classe da condição
  const getCondicaoClass = (condicao) => {
    if (!condicao) return ''
    const cond = condicao.toLowerCase()
    if (cond.includes('novo')) return 'novo'
    if (cond.includes('usado')) return 'usado'
    if (cond.includes('semi')) return 'seminovo'
    return ''
  }

  return (
    <div className="visualizacao-perfil">
      <div className="secao-anuncios">
        <h2>{ehMeuPerfil ? 'Meus Anúncios Ativos' : 'Anúncios Ativos'}</h2>

        {anunciosAtivos.length > 0 ? (
          <div className="anuncios-grid-perfil">
            {anunciosAtivos.map(anuncio => (
              <Link 
                key={anuncio.anuncioId} 
                to={`/anuncio/${anuncio.anuncioId}`}
                className="anuncio-link"
              >
                <div className="anuncio-card">
                  <div className="anuncio-imagem">
                    <img
                      src={anuncio.foto 
                        ? `http://localhost:3000/uploads/${anuncio.foto}`
                        : imagemPadrao}
                      alt={anuncio.nome}
                      onError={(e) => e.target.src = imagemPadrao}
                    />
                  </div>

                  <div className="anuncio-info">
                    <div className='anuncio-content'>
                      <span className="anuncio-nome">{anuncio.nome}</span>
                      <span className="anuncio-preco">
                        {anuncio.preco ? `R$ ${Number(anuncio.preco).toFixed(2)}` : "Preço não informado"}
                      </span>
                    </div>
                    <div className="anuncio-condicao">
                      <span className={`condicao-badge ${getCondicaoClass(anuncio.condicao)}`}>
                        {anuncio.condicao || 'Usado'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mensagem-vazia">
            {ehMeuPerfil 
              ? 'Você não possui anúncios ativos no momento.' 
              : 'Este usuário não possui anúncios ativos no momento.'
            }
          </p>
        )}
      </div>

      <div className="divider"></div>
      
      <div className="secao-avaliacoes">
        <h2>Avaliações</h2>
        {avaliacoes.length > 0 ? (
          <div className="avaliacoes-list">
            {avaliacoes.map(avaliacao => (
              <div key={avaliacao.avaliacoesId} className="avaliacao-card">
                <div className="avaliacao-header">
                  <div className="foto-perfil">
                    <img 
                      src={avaliacao.foto 
                        ? `http://localhost:3000/uploads/${avaliacao.foto}`
                        : imagemPadrao} 
                      alt={`Foto de ${avaliacao.nome}`} 
                      onError={(e) => e.target.src = imagemPadrao}
                    />
                  </div>
                  <div className="avaliacao-info">
                    <span className='estrelas-avaliacao'>{renderEstrelas(avaliacao.nota)}</span>
                    <span className="avaliacao-nome">{avaliacao.nome}</span>
                    <span className="avaliacao-data">
                      {avaliacao.data 
                        ? new Date(avaliacao.data).toLocaleDateString("pt-BR") 
                        : ""}
                    </span>
                  </div>
                </div>
                <p className="avaliacao-comentario">{avaliacao.comentario}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mensagem-vazia">
            {ehMeuPerfil 
              ? 'Você ainda não recebeu avaliações.' 
              : 'Este usuário ainda não recebeu avaliações.'
            }
          </p>
        )}
      </div>
    </div>
  )
}

export default ConteudoPerfil