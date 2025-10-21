import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoMdSearch, IoIosMenu, IoIosPin, IoIosArrowDown } from "react-icons/io";
import { TfiAnnouncement } from "react-icons/tfi";
import { IoChatboxOutline, IoPersonSharp, IoHeartOutline, IoCartOutline } from "react-icons/io5";
import { MdOutlineSell } from "react-icons/md";
import CursosDropdown from './CursosDropdown'; 
import NavbarSearch from './NavbarSearch';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' });
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchUsuario = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3000/usuario-logado', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return console.error('Não autenticado');
        const data = await res.json();
        setUsuario(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsuario();
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { icon: IoPersonSharp, label: 'Meu Perfil', onClick: () => navigate('/perfil2') },
    { icon: TfiAnnouncement, label: 'Meus Anúncios', onClick: () => navigate('/meusanuncios') },
    { icon: IoCartOutline, label: 'Minhas Compras', onClick: () => navigate('/minhascompras') },
    { icon: IoHeartOutline, label: 'Favoritos', onClick: () => navigate('/favorito') }
  ];

  return (
    <div className='container-navbarHome'>
      <div className="col-navbar" style={{width: '55%'}}>
        <img src="../../client/assets/UbuyLogo2.png" alt="Logo" style={{cursor: 'pointer'}} width={100} onClick={() => navigate('/home')}/>
        
        <NavbarSearch />

        {/* Menu Dropdown - Agora mostra o CursosDropdown quando clica no ícone */}
        <div className="menu-dropdown-container" ref={menuRef}>
        <IoIosMenu 
          className='menu-icon' 
          onClick={() => setMenuOpen(!menuOpen)}
        />

        {menuOpen && (
          <div className="menu-dropdown">
            <CursosDropdown />
          </div>
        )}
        </div>

        <div className="localizacao">
          <IoIosPin className='local-icon' />
          <span>{usuario?.instituicao || 'Localização não cadastrada'}</span>
        </div>

      </div>

      <div className="col-navbar">
        <div className="anuncios">
          <TfiAnnouncement className='anuncio-icon' />
          <Link to='/meusanuncios'><span>Meus anúncios</span></Link>
        </div>
      
        <div className="chat">
          <IoChatboxOutline className='chat-icon' />
          <Link to="/chat"><span>Chat</span></Link>
        </div>
    
        <button className="anunciar"><Link to="/criaranuncio"><span>Anunciar</span></Link></button>

        {usuario?.nome ? (
          <div
            className="dropdown-container"
            ref={dropdownRef}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className='logado'>
              <IoPersonSharp className='person-icon' /> Olá, {usuario?.nome || 'Carregando...'}
              <IoIosArrowDown className={`arrow-icon ${dropdownOpen ? 'rotate' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={index}
                      className="dropdown-item"
                      onClick={() => { item.onClick(); setDropdownOpen(false); }}
                    >
                      <IconComponent className="dropdown-icon" />
                      <span>{item.label}</span>
                    </div>
                  )
                })}
                <div className="dropdown-divider"></div>
                <div
                  className="dropdown-item logout"
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                >
                  <span>Sair</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <button className='logar'>
              <Link to="/login"><span>Entrar</span></Link>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;