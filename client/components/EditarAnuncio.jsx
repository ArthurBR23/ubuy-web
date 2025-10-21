import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2'
import Navbar from "./Navbar";

const EditarAnuncio = () => {
  const navigate = useNavigate();
  const { anuncioId } = useParams();

  const [anuncio, setAnuncio] = useState({
    nome: "",
    descricao: "",
    preco: "",
    curso: "",
    localizacao: "",
    condicao: 'novo',
    fotos: [],
    novasFotos: [],
  });

  const [fotoPreviews, setFotoPreviews] = useState([]);
  const [fotosRemovidas, setFotosRemovidas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarCursos = async () => {
    try {
      const res = await fetch('http://localhost:3000/cursos');
      const data = await res.json();
      setCursos(data.cursos || []);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setCarregando(false);
    }
  };

  const carregarAnuncio = async () => {
    try {
      const res = await fetch(`http://localhost:3000/anuncio/${localStorage.getItem("usuarioId")}`);
      const data = await res.json();
      if (res.ok) {
        const anuncioAtual = data.find(a => a.anuncioId === parseInt(anuncioId));
        if (!anuncioAtual) return navigate("/meusanuncios");

        setAnuncio({
          nome: anuncioAtual.nome,
          descricao: anuncioAtual.descricao,
          preco: anuncioAtual.preco,
          curso: anuncioAtual.curso,
          localizacao: anuncioAtual.localizacao || "",
          condicao: anuncioAtual.condicao || 'novo',
          fotos: anuncioAtual.fotos || [],
          novasFotos: [],
        });
        setFotoPreviews(anuncioAtual.fotos.map(f => `http://localhost:3000/uploads/${f}`));
      } else {
        alert("Erro ao carregar anúncio");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    }
  };

  useEffect(() => {
    carregarCursos();
    carregarAnuncio();
  }, [anuncioId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnuncio(prev => ({ ...prev, [name]: value }));
  };

  const handleFotosChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Verificar limite de 5 fotos
    const totalFotos = anuncio.fotos.length - fotosRemovidas.length + files.length;
    if (totalFotos > 5) {
      Swal.fire("Máximo de 5 fotos permitidas");
      return;
    }

    setAnuncio(prev => ({ ...prev, novasFotos: [...prev.novasFotos, ...files] }));

    const previews = files.map(f => URL.createObjectURL(f));
    setFotoPreviews(prev => [...prev, ...previews]);
  };

  const removerFoto = (index) => {
    const fotoRemovida = fotoPreviews[index];
    
    // Verificar se é uma foto existente (URL) ou nova (Blob)
    if (fotoRemovida.startsWith('http://localhost:3000/uploads/')) {
      // É uma foto existente - adicionar à lista de removidas
      const nomeArquivo = fotoRemovida.split('/').pop();
      setFotosRemovidas(prev => [...prev, nomeArquivo]);
    }
    
    setFotoPreviews(prev => prev.filter((_, i) => i !== index));
    setAnuncio(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
      novasFotos: prev.novasFotos.filter((_, i) => i !== (index - prev.fotos.length))
    }));
  };

  const handleSubmit = async () => {
    // Validações básicas
    if (!anuncio.nome.trim()) {
      Swal.fire("Por favor, preencha o nome do anúncio");
      return;
    }
    if (!anuncio.descricao.trim()) {
      Swal.fire("Por favor, preencha a descrição");
      return;
    }
    if (!anuncio.preco || parseFloat(anuncio.preco) <= 0) {
      Swal.fire("Por favor, insira um preço válido");
      return;
    }
    if (!anuncio.curso) {
      Swal.fire("Por favor, selecione um curso");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nome", anuncio.nome);
      formData.append("descricao", anuncio.descricao);
      formData.append("preco", anuncio.preco);
      formData.append("curso", anuncio.curso);
      formData.append("localizacao", anuncio.localizacao);
      formData.append("condicao", anuncio.condicao);

      // Adicionar fotos removidas
      fotosRemovidas.forEach(foto => {
        formData.append("fotosRemovidas", foto);
      });

      // Adicionar novas fotos
      anuncio.novasFotos.forEach(f => formData.append("fotos", f));

      const res = await fetch(`http://localhost:3000/anuncio/${anuncioId}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Anúncio atualizado com sucesso!",
          icon: "success",
          draggable: true
        });
        navigate("/meusanuncios");
      } else {
        alert(data.mensagem || "Erro ao atualizar anúncio");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="editar-anuncio-page">
      <Navbar />
      <div className="editar-anuncio-container">
        <div className="editar-anuncio-header">
          <h1>Editar Anúncio</h1>
          <p>Faça as alterações necessárias no seu anúncio</p>
        </div>
        
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label>Nome do Anúncio *</label>
              <input 
                type="text" 
                name="nome" 
                value={anuncio.nome} 
                onChange={handleChange}
                placeholder="Digite o nome do produto"
                required
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label>Descrição *</label>
              <textarea 
                name="descricao" 
                value={anuncio.descricao} 
                onChange={handleChange}
                placeholder="Descreva detalhadamente o produto..."
                rows="4"
                required
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label>Condição do Produto *</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="condicao"
                    value="novo"
                    checked={anuncio.condicao === 'novo'}
                    onChange={handleChange}
                  />
                  <span>Novo</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="condicao"
                    value="usado"
                    checked={anuncio.condicao === 'usado'}
                    onChange={handleChange}
                  />
                  <span>Usado</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Preço (R$) *</label>
              <input 
                type="number" 
                name="preco" 
                value={anuncio.preco} 
                onChange={handleChange}
                placeholder="0,00"
                min="0"
                step="0.01"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Curso Relacionado *</label>
              {carregando ? (
                <p className="carregando-text">Carregando cursos...</p>
              ) : (
                <select
                  name="curso"
                  value={anuncio.curso}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Selecione seu curso</option>
                  {cursos.map(curso => (
                    <option key={curso} value={curso}>{curso}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Localização</label>
              <input 
                type="text" 
                name="localizacao" 
                value={anuncio.localizacao} 
                onChange={handleChange}
                placeholder="Ex: Bloco A, Sala 101"
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label className="fotos-label">
                Fotos 
                <span className="fotos-counter">({fotoPreviews.length}/5)</span>
              </label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFotosChange}
                disabled={fotoPreviews.length >= 5}
                className="file-input"
                id="fotos-input"
              />
              <label 
                htmlFor="fotos-input" 
                className={`file-input-label ${fotoPreviews.length >= 5 ? 'disabled' : ''}`}
              >
                + Adicionar Fotos
              </label>
              
              <div className="fotos-info">
                {fotoPreviews.length >= 5 ? (
                  <span className="limite-alerta">Limite de 5 fotos atingido</span>
                ) : (
                  <span className="limite-info">Máximo 5 fotos permitidas</span>
                )}
              </div>
              
              <div className="fotos-previews">
                {fotoPreviews.map((f, i) => (
                  <div key={i} className="foto-preview">
                    <img src={f} alt={`Preview ${i + 1}`} />
                    <button
                      type="button"
                      className="remover-foto-btn"
                      onClick={() => removerFoto(i)}
                      title="Remover foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {fotoPreviews.length === 0 && (
                  <div className="sem-fotos">
                    <span>Nenhuma foto adicionada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="acoes-form">
          <button
            className="btn-cancelar"
            onClick={() => navigate("/meusanuncios")}
            disabled={loading}
            type="button"
          >
            Cancelar
          </button>
          <button 
            className="btn-salvar" 
            onClick={() => setShowModal(true)} 
            disabled={loading}
            type="button"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Confirmar alterações</h2>
              </div>
              <div className="modal-body">
                <p>Deseja salvar as alterações feitas neste anúncio?</p>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-confirmar" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Sim, Salvar"}
                </button>
                <button 
                  className="btn-cancelar-modal" 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditarAnuncio;