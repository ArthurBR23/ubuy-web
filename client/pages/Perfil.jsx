import React, { useEffect, useState } from "react";
import SidebarPerfil from "../components/SidebarPerfil";
import ConteudoPerfil from "../components/ConteudoPerfil";
import ReviewForm from "../components/ReviewForm";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const Perfil = () => {
  const { usuarioId } = useParams();
  const [usuario, setUsuario] = useState({});
  const [anuncio, setAnuncio] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [estatisticas, setEstatisticas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const res = await fetch(`http://localhost:3000/usuario/${usuarioId}`);
        const data = await res.json();
        
        console.log("📦 Dados recebidos do backend:", data);
        console.log("📊 Vendas:", data.vendas);
        console.log("🛒 Compras:", data.compras);

        setUsuario(data.usuario);
        setAnuncio(data.anuncio || []);
        setAvaliacoes(data.avaliacoes || []);

        // Agora usa os dados vindos do backend
        setEstatisticas({
          vendasRealizadas: data.vendas || 0,  // Do backend
          comprasRealizadas: data.compras || 0, // Do backend
          anunciosAtivos: (data.anuncio || []).filter(a => a.status === "ativo").length
        });

        console.log("✅ Estatísticas configuradas:", {
          vendasRealizadas: data.vendas || 0,
          comprasRealizadas: data.compras || 0,
          anunciosAtivos: (data.anuncio || []).filter(a => a.status === "ativo").length
        });

      } catch (error) {
        console.error("❌ Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarUsuario();
  }, [usuarioId]);

  const adicionarAvaliacao = (nova) => {
    setAvaliacoes(prev => [nova, ...prev]);
  };

  const mediaAvaliacoes =
    avaliacoes.length > 0
      ? (avaliacoes.reduce((acc, a) => acc + (a.nota || 0), 0) / avaliacoes.length).toFixed(1)
      : 0;

  if (loading) return <p>Carregando...</p>;
  if (!usuario) return <p>Perfil não encontrado</p>;

  return (
    <div className="perfil-page2">
      <Navbar />
      <div className="container">
        <div className="perfil-layout">
          <SidebarPerfil
            dadosUsuario={{
              ...usuario,
              nota: mediaAvaliacoes,
              avaliacoesCount: avaliacoes.length
            }}
            estatisticas={estatisticas}
          />
          <div className="perfil-content">
            <ConteudoPerfil
              anuncios={anuncio}
              avaliacoes={avaliacoes}
            />
            <ReviewForm
              usuarioAvaliadoId={usuarioId}
              onAvaliacaoCriada={adicionarAvaliacao}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;