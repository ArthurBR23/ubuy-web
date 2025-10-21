import React from 'react'
import { IoBagCheckOutline, IoCartOutline, IoMegaphoneOutline } from "react-icons/io5"

const SidebarPerfil2 = ({ dadosUsuario, estatisticas, modoEdicao, setModoEdicao }) => {
  // Função para gerar avatar com base no nome
  const generateAvatar = (name, sobrenome) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8A5C2', '#78E08F', '#FAD390', '#82CCDD', '#B8E994'
    ];
    
    const fullName = `${name || ''} ${sobrenome || ''}`.trim();
    const firstLetter = fullName ? fullName.charAt(0).toUpperCase() : 'U';
    const secondLetter = fullName.split(' ')[1] ? fullName.split(' ')[1].charAt(0).toUpperCase() : '';
    const initials = firstLetter + secondLetter;
    
    const colorIndex = fullName ? fullName.charCodeAt(0) % colors.length : 0;
    
    return {
      initials: initials || 'U',
      color: colors[colorIndex],
      fullName: fullName || 'Usuário'
    };
  };

  const avatar = generateAvatar(dadosUsuario.nome, dadosUsuario.sobrenome);

  const renderEstrelas = (nota) =>
    "★".repeat(Math.floor(nota || 0)) + "☆".repeat(5 - Math.floor(nota || 0))

  return (
    <div className="perfil-sidebar">
      <div className="perfil-info">
        <div className="foto-perfil">
          {dadosUsuario.fotoPerfil ? (
            <img
              src={`http://localhost:3000/uploads/${dadosUsuario.fotoPerfil}`}
              alt={`Foto de ${avatar.fullName}`}
              onError={(e) => {
                // Se a imagem falhar, mostra o avatar com letras
                e.target.style.display = 'none';
                const avatarElement = e.target.parentNode.querySelector('.avatar-com-letras');
                if (avatarElement) {
                  avatarElement.style.display = 'flex';
                }
              }}
            />
          ) : null}
          
          {/* Avatar com letras - sempre visível se não tem foto, ou como fallback */}
          <div 
            className="avatar-com-letras"
            style={{ 
              backgroundColor: avatar.color,
              display: dadosUsuario.fotoPerfil ? 'none' : 'flex'
            }}
          >
            <span className="avatar-iniciais">{avatar.initials}</span>
          </div>
        </div>

        <div className="usuario-header">
          <h2>{dadosUsuario.nome || 'Sem nome'} {dadosUsuario.sobrenome || ''}</h2>
          <p>{dadosUsuario.email || 'Sem email'}</p>
        </div>

        <p className="info-adicional">
          Na Ubuy desde{" "}
          {dadosUsuario.dataCadastro
            ? new Date(dadosUsuario.dataCadastro).toLocaleDateString("pt-BR")
            : "Data não informada"}
        </p>
        <p className="info-adicional">Da faculdade {dadosUsuario.instituicao}</p>
        <p className="info-adicional">Do curso {dadosUsuario.curso}</p>

        <div className="avaliacao-perfil">
          <div className="nota">{dadosUsuario.nota || 0}</div>
          <div className="estrelas">{renderEstrelas(dadosUsuario.nota)}</div>
          <div className="avaliacoes-count">
            ({dadosUsuario.avaliacoesCount || 0} avaliações)
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="estatisticas-sidebar">
        <h3>Estatísticas</h3>
        <div className="estatisticas-list">
          <div className="estatistica-item">
            <IoBagCheckOutline />
            <span>{estatisticas.vendasRealizadas} Vendas</span>
          </div>
          <div className="estatistica-item">
            <IoCartOutline />
            <span>{estatisticas.comprasRealizadas} Compras</span>
          </div>
          <div className="estatistica-item">
            <IoMegaphoneOutline />
            <span>{estatisticas.anunciosAtivos} Anúncios</span>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <button
        className="editar-perfil-btn"
        onClick={() => setModoEdicao(!modoEdicao)}
      >
        {modoEdicao ? 'Cancelar Edição' : 'Editar perfil'}
      </button>
    </div>
  )
}

export default SidebarPerfil2
