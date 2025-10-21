
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask";
import Swal from "sweetalert2";

const EditarPerfil = ({ setModoEdicao }) => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    celular: "",
    data_nascimento: "",
    cpf: "",
    fotoPerfil: null,
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    pix: "", 
    curso: "",
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [acao, setAcao] = useState(null);
  const [cursos, setCursos] = useState([]); // Estado para cursos

  const carregarUsuario = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/usuario", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (res.ok && data.usuario) {
      const u = data.usuario;

      console.log("📥 Dados carregados do backend:", u); // Debug

      setUsuario({
        nome: u.nome || "",
        sobrenome: u.sobrenome || "",
        email: u.email || "",
        celular: u.celular || "",
        data_nascimento: u.data_nascimento || "",
        cpf: u.cpf || "",
        cep: u.cep || "",
        logradouro: u.logradouro || "",
        numero: u.numero || "",
        bairro: u.bairro || "",
        cidade: u.cidade || "",
        uf: u.uf || "",
        pix: u.pix || "", // Agora deve carregar o PIX
        curso: u.curso || "", // Agora deve carregar o curso
        fotoPerfil: null,
      });

      if (u.fotoPerfil) {
        setFotoPreview(`http://localhost:3000/uploads/${u.fotoPerfil}`);
      }
    } else {
      alert(data.message || "Erro ao carregar perfil");
    }
  } catch (err) {
    console.error(err);
    alert("Erro de conexão com o servidor");
  }
};

  const carregarCursos = async () => {
    try {
      const res = await fetch("http://localhost:3000/cursos");
      const data = await res.json();
      setCursos(data.cursos || []);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
      setCursos([]);
    }
  };

  useEffect(() => {
    carregarUsuario();
    carregarCursos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPreview(URL.createObjectURL(file));
      setUsuario((prev) => ({ ...prev, fotoPerfil: file }));
    }
  };

  const buscarCEP = async () => {
    const cep = usuario.cep.replace(/\D/g, "");
    if (!cep) return Swal.fire("Informe um CEP válido");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setUsuario((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          uf: data.uf || "",
        }));
      } else {
        alert("CEP não encontrado");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao consultar CEP");
    }
  };

  const handleSubmit = async () => {
  setLoading(true);
  try {
    const formData = new FormData();
    
    // Debug: verificar o que está sendo enviado
    console.log("📤 Dados sendo enviados:", usuario);
    
    Object.entries(usuario).forEach(([key, value]) => {
      if (key === "fotoPerfil" && value instanceof File) {
        formData.append("fotoPerfil", value);
      } else {
        formData.append(key, value || "");
      }
    });

    for (let [key, value] of formData.entries()) {
      console.log(`📦 FormData: ${key} = ${value}`);
    }

    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/editarperfil", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      Swal.fire({
        title: "Perfil atualizado com sucesso!",
        icon: "success",
        draggable: true
      });
      setModoEdicao(false);
      navigate("/perfil2");
    } else {
      alert(data.message || "Erro ao atualizar perfil");
    }
  } catch (err) {
    console.error(err);
    alert("Erro de conexão com o servidor");
  } finally {
    setLoading(false);
    setShowModal(false);
  }
};

  const handleExcluir = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/excluirperfil", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: "Conta excluída com sucesso!",
          icon: "success",
          draggable: true
        });
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert(data.message || "Erro ao excluir conta");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    }
  };

  const handleDesativar = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/desativarperfil", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: "Conta desativada com sucesso!",
          text: "Você poderá reativá-la futuramente.",
          icon: "success",
          draggable: true
        });
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert(data.message || "Erro ao desativar conta");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    }
  };

  const formatarParaInputDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  return (
    <div className="edicao-perfil">
      <h2>Editando Perfil</h2>

      <div className="form-section">
        <h3>Informações Pessoais</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Nome:</label>
            <input type="text" name="nome" value={usuario.nome} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Sobrenome:</label>
            <input type="text" name="sobrenome" value={usuario.sobrenome} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Data de Nascimento</label>
            <input
              type="date"
              name="data_nascimento"
              value={formatarParaInputDate(usuario.data_nascimento)}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Celular</label>
            <IMaskInput
              mask="(00) 00000-0000"
              value={usuario.celular}
              onAccept={(value) => setUsuario((prev) => ({ ...prev, celular: value }))}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-group">
            <label>Chave PIX</label>
            <input
              type="text"
              name="pix"
              value={usuario.pix}
              onChange={handleChange}
              placeholder="Seu email, telefone ou CPF para recebimentos"
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Informe seu email, telefone ou CPF para receber pagamentos
            </small>
          </div>

          {/* NOVO CAMPO: Curso */}
          <div className="form-group">
            <label>Curso</label>
            <select name="curso" value={usuario.curso} onChange={handleChange}>
              <option value="">Selecione seu curso</option>
              {cursos.map((curso, index) => (
                <option key={index} value={curso}>
                  {curso}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label>CEP</label>
            <IMaskInput
              mask="00000-000"
              value={usuario.cep}
              onAccept={(value) => setUsuario((prev) => ({ ...prev, cep: value }))}
              placeholder="00000-000"
            />
            <button type="button" onClick={buscarCEP}>Buscar CEP</button>
          </div>

          {["logradouro", "numero", "bairro", "cidade", "uf"].map((campo) => (
            <div className="form-group" key={campo}>
              <label>{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
              <input type="text" name={campo} value={usuario[campo]} onChange={handleChange} />
            </div>
          ))}

          <div className="form-group">
            <label>Foto</label>
            <button type="button" onClick={() => document.getElementById("fotoInput").click()}>
              Alterar Foto
            </button>
            <input
              id="fotoInput"
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              style={{ display: "none" }}
            />
            {fotoPreview && (
              <img
                src={fotoPreview}
                alt="Preview"
                style={{ width: "100px", height: "100px", objectFit: "fill", marginTop: "0.5rem", borderRadius: "50%" }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Informações da Conta</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>CPF</label>
            <input type="text" value={usuario.cpf} disabled />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={usuario.email} disabled />
          </div>
        </div>
      </div>

      <div className="form-section perigo">
        <h3>Zona de Perigo</h3>
        <p>Você pode desativar sua conta temporariamente ou excluí-la permanentemente.</p>
        <div className="buttons">
          <button
            className="desativar-btn"
            onClick={() => { setAcao("desativar"); setShowModal(true); }}
          >
            Desativar Conta
          </button>

          <button
            className="excluir-btn"
            onClick={() => { setAcao("excluir"); setShowModal(true); }}
          >
            Excluir Conta
          </button>
        </div>
      </div>

      <div className="acoes-form">
        <button className="salvar-btn" onClick={() => { setAcao("salvar"); setShowModal(true); }}>
          Salvar Alterações
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              {acao === "salvar"
                ? "Salvar alterações?"
                : acao === "desativar"
                ? "Deseja desativar sua conta?"
                : "Excluir conta permanentemente?"}
            </h2>

            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
              <button
                onClick={() => {
                  if (acao === "salvar") handleSubmit();
                  else if (acao === "desativar") handleDesativar();
                  else handleExcluir();
                }}
              >
                Confirmar
              </button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarPerfil;