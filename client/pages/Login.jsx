import React, { useState } from 'react';
import LoginNavbar from '../components/loginNavbar';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import jwt_decode from "jwt-decode";
import Swal from 'sweetalert2';

const Login = () => {
  const navigate = useNavigate();
  const [contaInativa, setContaInativa] = useState(false);
  const [emailReativar, setEmailReativar] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleLogin = async (formData) => {
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.status === 403 && data.message?.includes("desativada")) {
        setEmailReativar(formData.email);
        setContaInativa(true);
        return; 
      }

      if (res.ok) {
        localStorage.setItem("token", data.token);
        const decoded = jwt_decode(data.token);
        localStorage.setItem("usuarioId", decoded.usuarioId);
        navigate("/home");
      } else {
        alert(data.message || "Erro no login");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      alert("Falha ao conectar com o servidor");
    }
  };

  const handleReativar = async () => {
    try {
      const res = await fetch("http://localhost:3000/reativarperfil", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: emailReativar })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire('Sucesso', 'Conta reativada com sucesso!', 'success');
        setContaInativa(false);
        navigate("/login");
      } else {
        alert(data.message || "Erro ao reativar conta");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    }
  };

  return (
    <div className='login-page'>
      <LoginNavbar />
      <div className="login-container">
        <div className='form-container'>
          <img src="../../client/assets/UbuyLogo2.png" alt="Logo Ubuy" width={150} />
          <span className='title-logo'>Olá, acesse sua conta no Ubuy</span>

          {!contaInativa ? (
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="input">
                <span className='title-input'>E-mail:</span>
                <input
                  {...register("email", { required: true })}
                  placeholder='Insira seu e-mail universitário'
                />
                {errors.email && <p className="error">O e-mail é obrigatório.</p>}
              </div>

              <div className="input">
                <span className='title-input'>Senha:</span>
                <input
                  type='password'
                  {...register("senha", { required: true })}
                  placeholder='Insira sua senha'
                />
                {errors.senha && <p className="error">A senha é obrigatória.</p>}
              </div>

              <button type='submit'>Entrar</button>

              <span className='click'>
                <Link to="/senha">Esqueci minha senha</Link>
              </span>
              <span className='click'>
                Ainda não possui cadastro? <Link to="/cadastro">Clique aqui</Link>
              </span>
            </form>
          ) : (
            <div style={{ textAlign: "center" }}>
              <h3>Sua conta está desativada.</h3>
              <p>Deseja reativá-la para continuar?</p>
              <button
                onClick={handleReativar}
                style={{
                  backgroundColor: "#5cb85c",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Reativar Conta
              </button>
              <button
                onClick={() => setContaInativa(false)}
                style={{
                  marginLeft: "10px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  cursor: "pointer"
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
