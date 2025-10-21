import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoArrowForward,
  IoImageOutline,
  IoDocumentTextOutline,
  IoPricetagOutline,
  IoSchoolOutline,
} from 'react-icons/io5';
import Swal from 'sweetalert2';

const CriarAnuncio1 = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div className="criar-anuncio-page etapas-design">
        <Navbar />
        <div className="not-logged-container with-icon">
          <h2>Você precisa estar logado para acessar esta página.</h2>
          <button className="login-btn" onClick={() => navigate('/login')}>
            Fazer Login
          </button>
        </div>
      </div>
    );
  }
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dadosAnuncio, setDadosAnuncio] = useState({
    nome: '',
    descricao: '',
    preco: '',
    curso: '',
    condicao: 'novo',
    fotos: [],
  });

  const etapas = [
    { status: 1, nome: 'Informações Básicas', icon: IoDocumentTextOutline },
    { status: 2, nome: 'Preço & Curso', icon: IoPricetagOutline },
    { status: 3, nome: 'Fotos', icon: IoImageOutline },
  ];

  const carregarCursos = async () => {
    try {
      const res = await fetch('http://localhost:3000/cursos');
      const data = await res.json();
      setCursos(data.cursos);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  useEffect(() => {
    carregarCursos();
  }, []);

  const handleInputChange = (campo, valor) => {
    setDadosAnuncio((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const proximaEtapa = () => {
    if (etapaAtual < 3) setEtapaAtual(etapaAtual + 1);
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) setEtapaAtual(etapaAtual - 1);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/jpg'
    );

    if (files.length + dadosAnuncio.fotos.length > 5) {
      Swal.fire('Máximo de 5 fotos permitidas');
      return;
    }

    const novasFotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setDadosAnuncio((prev) => ({
      ...prev,
      fotos: [...prev.fotos, ...novasFotos],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      Swal.fire('Usuário não autenticado');
      return;
    }

    if (
      !dadosAnuncio.nome ||
      !dadosAnuncio.descricao ||
      !dadosAnuncio.preco ||
      !dadosAnuncio.curso ||
      !dadosAnuncio.condicao
    ) {
      Swal.fire('Preencha todos os campos obrigatórios!');
      return;
    }

    const formData = new FormData();
    formData.append('usuarioId', usuarioId);
    formData.append('nome', dadosAnuncio.nome);
    formData.append('descricao', dadosAnuncio.descricao);
    formData.append('condicao', dadosAnuncio.condicao);
    formData.append('preco', dadosAnuncio.preco);
    formData.append('curso', dadosAnuncio.curso);

    if (dadosAnuncio.fotos && dadosAnuncio.fotos.length > 0) {
      for (let i = 0; i < dadosAnuncio.fotos.length; i++) {
        formData.append('fotos', dadosAnuncio.fotos[i].file);
      }
    }

    try {
      const res = await fetch('http://localhost:3000/anuncio', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        Swal.fire({
          title: 'Anúncio criado com sucesso!',
          icon: 'success',
          draggable: true,
        });
        window.location.href = '/meusanuncios';
      } else {
        const erro = await res.json();
        alert('Erro: ' + erro.erro);
      }
    } catch (err) {
      console.error('Erro ao salvar anúncio:', err);
      alert('Erro no servidor');
    }
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="etapa-conteudo">
            <h3>Informações do Produto</h3>
            <div className="form-group">
              <label>Título do Anúncio *</label>
              <input
                type="text"
                placeholder="Ex: Livro de Cálculo 1 - Edição 2024"
                value={dadosAnuncio.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Descrição *</label>
              <textarea
                placeholder="Descreva detalhadamente o produto..."
                rows="5"
                value={dadosAnuncio.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Condição do Produto</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="condicao"
                    value="novo"
                    checked={dadosAnuncio.condicao === 'novo'}
                    onChange={(e) =>
                      handleInputChange('condicao', e.target.value)
                    }
                  />
                  <span>Novo</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="condicao"
                    value="usado"
                    checked={dadosAnuncio.condicao === 'usado'}
                    onChange={(e) =>
                      handleInputChange('condicao', e.target.value)
                    }
                  />
                  <span>Usado</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="etapa-conteudo">
            <h3>Preço e Curso Relacionado</h3>
            <div className="form-group">
              <label>Preço (R$) *</label>
              <input
                type="number"
                placeholder="0,00"
                step="0.01"
                value={dadosAnuncio.preco}
                onChange={(e) => handleInputChange('preco', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Curso Relacionado *</label>
              {carregando ? (
                <div className="carregando-cursos">
                  <p>Carregando cursos...</p>
                </div>
              ) : (
                <select
                  value={dadosAnuncio.curso}
                  onChange={(e) => handleInputChange('curso', e.target.value)}
                  required
                >
                  <option value="">Selecione seu curso</option>
                  {cursos.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="info-curso">
              <p>
                🎓 Selecione o curso relacionado ao produto para ajudar outros
                estudantes a encontrarem seu anúncio
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="etapa-conteudo">
            <h3>Fotos do Produto</h3>

            <div
              className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length + dadosAnuncio.fotos.length > 5) {
                    Swal.fire('Máximo de 5 fotos permitidas');
                    return;
                  }

                  const novasFotos = files.map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                  }));

                  setDadosAnuncio((prev) => ({
                    ...prev,
                    fotos: [...prev.fotos, ...novasFotos],
                  }));
                }}
                style={{ display: 'none' }}
              />

              <label htmlFor="file-upload" className="upload-placeholder">
                <IoImageOutline className="upload-icon" />
                <p>Clique para selecionar fotos ou arraste para aqui</p>
                <span>Máximo 5 fotos • Formatos: JPG, PNG</span>
                <span className="fotos-contador">
                  {dadosAnuncio.fotos.length}/5 fotos selecionadas
                </span>
              </label>
            </div>

            {dadosAnuncio.fotos.length > 0 && (
              <div className="preview-fotos">
                <h4>Fotos Selecionadas:</h4>
                <div className="fotos-grid">
                  {dadosAnuncio.fotos.map((foto, index) => (
                    <div key={index} className="foto-item">
                      <img src={foto.preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="btn-remover-foto"
                        onClick={() => {
                          const novasFotos = [...dadosAnuncio.fotos];
                          novasFotos.splice(index, 1);
                          setDadosAnuncio((prev) => ({
                            ...prev,
                            fotos: novasFotos,
                          }));
                        }}
                      >
                        ×
                      </button>
                      <span className="foto-nome">{foto.file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="dicas-fotos">
              <h4>Dicas para boas fotos:</h4>
              <ul>
                <li>Use boa iluminação natural</li>
                <li>Mostre o produto de diferentes ângulos</li>
                <li>Destaque detalhes importantes</li>
                <li>Evite fotos borradas ou escuras</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="criar-anuncio-page etapas-design">
      <Navbar />
      <div className="container">
        <div className="criar-anuncio-header">
          <h1>Criar Anúncio</h1>
          <p>Preencha as informações do seu produto para vender na Ubuy</p>
        </div>

        <div className="anuncio-wizard">
          <div className="progresso-etapas">
            {etapas.map((etapa) => {
              const IconComponent = etapa.icon;
              return (
                <div
                  key={etapa.status}
                  className={`etapa-item ${
                    etapa.status === etapaAtual ? 'ativa' : ''
                  } ${etapa.status < etapaAtual ? 'concluida' : ''}`}
                >
                  <div className="etapa-marcador">
                    <IconComponent />
                  </div>
                  <span className="etapa-nome">{etapa.nome}</span>
                </div>
              );
            })}
          </div>

          <div className="anuncio-form">
            {renderEtapa()}

            <div className="navegacao-etapas">
              {etapaAtual > 1 && (
                <button
                  type="button"
                  className="btn-voltar"
                  onClick={etapaAnterior}
                >
                  <IoArrowBack />
                  Voltar
                </button>
              )}

              {etapaAtual < 3 ? (
                <button
                  type="button"
                  className="btn-proximo"
                  onClick={proximaEtapa}
                >
                  Próximo
                  <IoArrowForward />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-publicar"
                  onClick={handleSubmit}
                >
                  Publicar Anúncio
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarAnuncio1;