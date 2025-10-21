import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import LoginNavbar from '../components/loginNavbar';
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import Swal from 'sweetalert2';

const Cadastro = () => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({ shouldFocusError: false });

  const [selectedDate, setSelectedDate] = useState(null);
  const [universidades, setUniversidades] = useState([]);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [cursos, setCursos] = useState([]);

  const navigate = useNavigate();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 17);

  const carregarUniversidades = async () => {
    try {
      const res = await fetch('http://localhost:3000/universidades');
      const data = await res.json();
      const universidadesUnicas = [
        ...new Map(data.map((u) => [u.sigla, u])).values(),
      ];
      setUniversidades(universidadesUnicas);
    } catch (error) {
      console.error('Erro ao carregar universidades:', error);
    }
  };

  useEffect(() => {
    carregarUniversidades();
  }, []);

  const senha = watch('senha');

  const formatCPF = (value) => value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  const formatCelular = (value) => value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');

  const onSubmit = async (data) => {
    try {
      const payload = {
        nome: data.nome,
        sobrenome: data.sobrenome,
        email: data.email,
        senha: data.senha,
        cpf: data.cpf,
        celular: data.celular,
        data_nascimento: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
        sexo: data.sexo,
        instituicao: data.instituicao,
        curso: data.curso, 
      };

      const resposta = await fetch('http://localhost:3000/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resultado = await resposta.json();

      if (resultado.success) {
        Swal.fire('Sucesso', 'Usuário cadastrado com sucesso!', 'success');
        reset();
        setSelectedDate(null);
        navigate('/login');
      } else {
        window.alert(resultado.message || 'Erro ao cadastrar usuário');
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      window.alert('Erro ao cadastrar usuário');
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
  carregarUniversidades();
  carregarCursos();
}, []);


  return (
    <div className="cadastro-page">
      <LoginNavbar />
      <div className="cadastro-container">
        <div className="form-container">
          <img src="../../client/assets/UbuyLogo2.png" alt="Logo" width={150} />
          <span className="title-logo">Olá, crie sua conta no Ubuy</span>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row">

              <div className="col">
                <div className="input">
                  <span className="title-input">Nome:</span>
                  <input
                    {...register('nome', { required: 'O nome é obrigatório' })}
                    placeholder="Insira seu nome"
                  />
                  {errors.nome && <span className="error-message">{errors.nome.message}</span>}
                </div>

                <div className="input">
                  <span className="title-input">Sobrenome:</span>
                  <input
                    {...register('sobrenome', { required: 'O sobrenome é obrigatório' })}
                    placeholder="Insira seu sobrenome"
                  />
                  {errors.sobrenome && <span className="error-message">{errors.sobrenome.message}</span>}
                </div>

                <div className="input">
                  <span className="title-input">E-mail:</span>
                  <input
                    {...register('email', { required: 'O e-mail é obrigatório' })}
                    placeholder="Insira seu e-mail universitário"
                  />
                  {errors.email && <span className="error-message">{errors.email.message}</span>}
                </div>

                <div className="input">
                  <span className="title-input">Curso:</span>
                  <select
                    {...register("curso", { required: "O curso é obrigatório" })}
                    defaultValue=""
                  >
                    <option value="">Selecione seu curso</option>
                    {cursos.map((curso, index) => (
                      <option key={index} value={curso}>
                        {curso}
                      </option>
                    ))}
                  </select>
                  {errors.curso && <span className="error-message">{errors.curso.message}</span>}
                </div>
                <div className="input">
                  <span className="title-input">Celular:</span>
                  <Controller
                    name="celular"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        onChange={(e) => {
                          e.target.value = formatCelular(e.target.value);
                          field.onChange(e);
                        }}
                      />
                    )}
                    rules={{
                      required: 'O celular é obrigatório',
                      pattern: {
                        value: /^\(\d{2}\) \d{5}-\d{4}$/,
                        message: 'Formato de celular inválido',
                      },
                    }}
                  />
                  {errors.celular && <span className="error-message">{errors.celular.message}</span>}
                </div>
                
              </div>

              <div className="col">
                

                <div className="input">
                  <span className="title-input">Senha:</span>
                  <div className="password-field">
                    <input
                      type={showSenha ? 'text' : 'password'}
                      {...register('senha', {
                        required: 'A senha é obrigatória',
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
                          message:
                            'A senha deve ter no mínimo 6 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial',
                        },
                      })}
                      placeholder="Crie sua senha segura"
                    />
                    <button
                      type="button"
                      className="show-hide-btn"
                      onClick={() => setShowSenha(!showSenha)}
                    >
                      {showSenha ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.senha && <span className="error-message">{errors.senha.message}</span>}
                </div>

                <div className="input">
                  <span className="title-input">Confirmar senha:</span>
                  <div className="password-field">
                    <input
                      type={showConfirmarSenha ? 'text' : 'password'}
                      {...register('confirmarSenha', {
                        required: 'Confirme sua senha',
                        validate: (value) =>
                          value === senha || 'As senhas não conferem',
                      })}
                      placeholder="Confirme sua senha"
                    />
                    <button
                      type="button"
                      className="show-hide-btn"
                      onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                    >
                      {showConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmarSenha && <span className="error-message">{errors.confirmarSenha.message}</span>}
                </div>
                <div className="input">
                  <span className="title-input">Instituição:</span>
                  <input
                    list="lista-universidades"
                    {...register('instituicao')}
                    placeholder="Digite ou selecione sua instituição"
                  />
                  <datalist id="lista-universidades">
                    {universidades.map((uni) => (
                      <option key={`${uni.sigla}-${uni.nome}`} value={uni.sigla} />
                    ))}
                  </datalist>
                </div>

                <div className="date-sexo">
                  <div className="input-half">
                    <span className="title-input">Data de nascimento:</span>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="dd/MM/yyyy"
                      maxDate={maxDate}
                      showYearDropdown
                      scrollableYearDropdown
                      placeholderText="Selecione sua data de nascimento"
                    />
                  </div>

                  <div className="input-half">
                    <span className="title-input">Sexo:</span>
                    <select {...register('sexo')}>
                      <option value="">Selecione seu sexo</option>
                      <option value="feminino">Feminino</option>
                      <option value="masculino">Masculino</option>
                      <option value="naoInformado">Prefiro não informar</option>
                    </select>
                  </div>
                </div>

                <div className="input">
                  <span className="title-input">CPF:</span>
                  <Controller
                    name="cpf"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        onChange={(e) => {
                          e.target.value = formatCPF(e.target.value);
                          field.onChange(e);
                        }}
                      />
                    )}
                    rules={{
                      required: 'O CPF é obrigatório',
                      pattern: {
                        value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                        message: 'Formato de CPF inválido',
                      },
                    }}
                  />
                  {errors.cpf && <span className="error-message">{errors.cpf.message}</span>}
                </div>
              </div>
            </div>

            <button type="submit" className="button-cadastro">
              Cadastrar
            </button>

            <span className="click">
              Já possui cadastro? <a href="/login">Clique aqui</a> para entrar
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
