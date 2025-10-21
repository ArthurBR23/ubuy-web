import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Chats from './pages/Chats';
import Item from './pages/Item'
import Senha from './pages/Senha';
import './styles/styles.scss';
import MeusAnuncios from './pages/MeusAnuncios';
import MinhasCompras from './pages/MinhasCompras';
import EditarPerfil from './components/EditarPerfil';
import Perfil2 from './pages/Perfil2';
import CriarAnuncio from './pages/CriarAnuncio';
import EditarAnuncio from './components/EditarAnuncio';
import CursosDropdown from './components/CursosDropdown';
import AnuncioFavorito from './components/AnuncioFavorito';
import Favoritos from './pages/Favoritos'
import Perfil from "./pages/Perfil";
import SearchProfiles from "./pages/SearchProfiles";
import ItemComprado from './pages/ItemComprado';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/senha" element={<Senha />} />
          <Route path="/home" element={<Home />} />
          <Route path='/anuncio/:anuncioId' element={<Item />} />
          <Route path='/editarperfil' element={<EditarPerfil />} />
          <Route path='/editaranuncio/:anuncioId' element={<EditarAnuncio />} />
          <Route path="/cursosdropdown" element={<CursosDropdown />} />
          <Route path="/anunciofavorito" element={<AnuncioFavorito />} />
          <Route path="/favorito" element={<Favoritos />} />
          <Route path="/chat" element={<Chats />} />
          <Route path="/perfil2" element={<Perfil2 />} />
          <Route path="/criaranuncio" element={<CriarAnuncio />} />
          <Route path="/meusanuncios" element={<MeusAnuncios />} />
          <Route path="/minhascompras" element={<MinhasCompras />} />
          <Route path="/perfil2/:usuarioId" element={<Perfil/>} />
          <Route path="/buscar" element={<SearchProfiles/>} />
          <Route path="/itemcomprado/:anuncioId" element={<ItemComprado />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
