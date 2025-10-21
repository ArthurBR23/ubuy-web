import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SidebarPerfil2 from '../components/SidebarPerfil2'
import ConteudoPerfil from '../components/ConteudoPerfil'
import EditarPerfil from '../components/EditarPerfil'

const Perfil2 = () => {
  const navigate = useNavigate()
  const [modoEdicao, setModoEdicao] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [anuncios, setAnuncios] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])

 const carregarUsuario = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/usuario", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (res.ok && data.usuario) {
      const u = data.usuario;

      // AGORA: data.vendas e data.compras virão do backend
      const vendas = data.vendas || 0
      const compras = data.compras || 0

      const avaliacoes = data.avaliacoes || [];
      const mediaNota =
        avaliacoes.length > 0
          ? avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length
          : 0;

      setUsuario({
        ...u,
        nota: mediaNota,
        avaliacoesCount: avaliacoes.length,
        vendas,
        compras,
        cep: u.cep || "",
        logradouro: u.logradouro || "",
        numero: u.numero || "",
        bairro: u.bairro || "",
        cidade: u.cidade || "",
        uf: u.uf || "",
      });

      setAnuncios((data.anuncio || []).filter((a) => a.status === "ativo"));
      setAvaliacoes(avaliacoes);
    } else {
      alert(data.message || "Erro ao carregar perfil");
    }
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    alert("Erro de conexão com o servidor");
  }
};

  useEffect(() => {
    carregarUsuario()
  }, [])

  if (!usuario) return <p>Carregando perfil...</p>

  return (
    <div className='perfil-page'>
      <Navbar />
      <div className="container">
        <div className="perfil-layout">

          <SidebarPerfil2
            dadosUsuario={usuario}
            estatisticas={{
              vendasRealizadas: usuario.vendas || 0,
              comprasRealizadas: usuario.compras || 0,
              anunciosAtivos: anuncios.length
            }}
            modoEdicao={modoEdicao}
            setModoEdicao={setModoEdicao}
          />

          <div className="perfil-content">
            {modoEdicao ? (
              <EditarPerfil
                usuario={usuario}
                setUsuario={setUsuario}
                setModoEdicao={setModoEdicao}  
              />
            ) : (
              <ConteudoPerfil
                anuncios={anuncios}
                avaliacoes={avaliacoes}
                usuario={usuario}
              />
            )}

          </div>

        </div>
      </div>
    </div>
  )
}

export default Perfil2
