import React from 'react';
import SenhaNavbar from '../components/senhaNavbar';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';


const Senha = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:3000/senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          celular: data.celular,
          canal: data.canal,
        }),
      });

      const text = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(text);
      } catch {
        console.error("Resposta inesperada do servidor:", text);
        alert("Erro: servidor não retornou JSON.");
        return;
      }

      const success =
        response.ok &&
        (responseData.status === 'success' ||
         (responseData.message && /bem-?suced/i.test(responseData.message)));

      if (success) {
        navigate('/login', { replace: true });
        return;
      }

      alert(responseData.message || 'Falha ao atualizar senha.');
    } catch (error) {
      console.error('Erro de conexão:', error);
      alert('Falha ao conectar com o servidor.');
    }
  };

  return (
    <div className='senha-page'>
      <SenhaNavbar />
      <div className="senha-container">
        <div className='form-container'>
          <img src="../../client/assets/UbuyLogo2.png" alt="Logo Ubuy" width={150} />
          <span className='title-logo'>Recupere sua senha Ubuy</span>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input">
              <span className='title-input'>Email:</span>
              <input
                {...register("email", { required: "O e-mail é obrigatório." })}
                placeholder='E-mail universitário'
              />
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>

            <div className="input">
              <span className='title-input'>Celular:</span>
              <input
                type="tel"
                {...register("celular", {
                  required: "O celular é obrigatório.",
                  pattern: {
                    value: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
                    message: 'Digite um celular válido com DDD',
                  },
                })} placeholder='Celular'
              />
              {errors.celular && <p className="error">{errors.celular.message}</p>}
            </div>

            <div>
              <select {...register('canal', { required: "Selecione um canal." })}>
                <option value="">-- Escolha --</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>
              {errors.canal && <p className="error">{errors.canal.message}</p>}
            </div>

            <span className='click'>
              <Link to="/login">Voltar para login</Link>
            </span>

            <button type='submit' disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Recuperar"}
            </button>
           
          </form>
        </div>
      </div>
    </div>
  );
};

export default Senha;
