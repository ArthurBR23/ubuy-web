import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const MinhasCompras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErro("Você precisa estar logado para ver suas compras.");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:3000/minhascompras", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Erro ao buscar suas compras");
        }

        const data = await res.json();
        console.log("Resposta /minhascompras:", data); 
        
        // Buscar detalhes completos de cada anúncio para obter informações do vendedor
        const comprasComDetalhes = await Promise.all(
          (data.compras || []).map(async (compra) => {
            try {
              const resAnuncio = await fetch(`http://localhost:3000/anuncio/detalhes/${compra.anuncioId}`);
              if (resAnuncio.ok) {
                const detalhesAnuncio = await resAnuncio.json();
                return {
                  ...compra,
                  nomeVendedor: detalhesAnuncio.usuarioNome || "Não informado",
                  usuarioId: detalhesAnuncio.usuarioId
                };
              }
              return compra;
            } catch (error) {
              console.error(`Erro ao buscar detalhes do anúncio ${compra.anuncioId}:`, error);
              return compra;
            }
          })
        );
        
        setCompras(comprasComDetalhes);
      } catch (err) {
        console.error(err);
        setErro(err.message || "Erro ao buscar suas compras");
      } finally {
        setLoading(false);
      }
    };

    fetchCompras();
  }, []);

  const formatarData = (dataString) => {
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

  const formatarPreco = (preco) => {
    return parseFloat(preco).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const verDetalhesCompra = (compra) => {
    // Passa a data da compra como state na navegação
    navigate(`/itemcomprado/${compra.anuncioId}`, {
      state: {
        dataCompra: compra.data_compra
      }
    });
  };

  if (loading) {
    return (
      <div className="minhas-compras-page">
        <Navbar />
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando suas compras...</p>
          </div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="minhas-compras-page">
        <Navbar />
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Ops! Algo deu errado</h3>
            <p>{erro}</p>
            <button 
              className="btn-retry"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="minhas-compras-page">
      <Navbar />
      <div className="container">
        <div className="compras-header">
          <h1>Minhas Compras</h1>
          <div className="compras-stats">
            <span className="total-compras">{compras.length} compra{compras.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {compras.length > 0 ? (
          <div className="compras-list">
            {compras.map((compra, index) => (
              <div
                key={compra.compraId || compra.id || index} 
                className="compra-card"
              >
                <div className="compra-content">
                  <div className="compra-imagem">
                    <img
                      src={`http://localhost:3000/uploads/${compra.fotoAnuncio}`}
                      alt={compra.nomeAnuncio}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWODBIMzBWMTIwSDEyMFYxMDBIMzBWNjBIOThaIiBmaWxsPSIjQ0RDRENEIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>

                  <div className="compra-info">
                    <h3 className="compra-nome">{compra.nomeAnuncio}</h3>
                    <p className="compra-descricao">
                      {compra.descricao || "Sem descrição disponível"}
                    </p>
                    
                    <div className="compra-detalhes">
                      <div className="compra-preco">
                        R$ {formatarPreco(compra.precoAnuncio)}
                      </div>
                      <div className="compra-vendedor">
                        <span>Vendedor: {compra.nomeVendedor || "Não informado"}</span>
                      </div>
                      <div className="compra-data-info">
                        <small>Compra realizada em: {formatarData(compra.data_compra)}</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="compra-actions">
                  <button 
                    className="btn-detalhes"
                    onClick={() => verDetalhesCompra(compra)}
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Nenhuma compra encontrada</h3>
            <p>Você ainda não fez nenhuma compra. Que tal explorar alguns anúncios?</p>
            <button 
              className="btn-explorar"
              onClick={() => navigate('/')}
            >
              Explorar Anúncios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinhasCompras;