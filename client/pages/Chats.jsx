import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Chats = ({ usuarioNome }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [messagesByConv, setMessagesByConv] = useState(() => {
    const saved = localStorage.getItem("messagesByConv");
    return saved ? JSON.parse(saved) : {};
  });
  const [inputText, setInputText] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profilesList, setProfilesList] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const socketRef = useRef();
  const chatEndRef = useRef();
  const currentUserNameRef = useRef(null);
  const currentUserIdRef = useRef(null);

  const API = "http://localhost:3000/";

  // 🔹 Funções utilitárias
  const getAuthToken = () => {
    try {
      const m = document.cookie.match("(^|;)\\s*token=([^;]+)");
      if (m && m[2]) return m[2];
    } catch {}
    try {
      const ls = localStorage.getItem("token");
      if (ls) return ls;
    } catch {}
    return null;
  };

  const parseJwt = (token) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
      return {};
    }
  };

  const generateAvatar = (name) => {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
      "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    ];
    const firstLetter = name.charAt(0).toUpperCase();
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { letter: firstLetter, color: colors[colorIndex] };
  };

  // 🔹 Buscar detalhes do usuário
  const fetchUserDetails = async (userId) => {
    try {
      const token = getAuthToken();
      const res = await axios.get(`${API}usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usuario = res.data?.usuario || res.data;
      if (!usuario) return null;

      const updated = {
        id: usuario.usuarioId || usuario.id || userId,
        name: usuario.nome || usuario.name || `Usuário ${userId}`,
        fotoPerfil: usuario.fotoPerfil || null,
        avatar: generateAvatar(usuario.nome || usuario.name || `U${userId}`),
      };

      setProfilesList(prev => {
        const exists = prev.find(p => p.id === updated.id);
        if (exists) return prev.map(p => p.id === updated.id ? { ...p, ...updated } : p);
        return [...prev, updated];
      });

      if (selectedProfile?.id === updated.id) setSelectedProfile(updated);

      return updated;
    } catch {
      return null;
    }
  };

  // 🔹 Iniciar chat com um contato
  const startChatWith = (profile) => {
    setSelectedProfile(profile);
    fetchUserDetails(profile.id).catch(() => {});

    setProfilesList(prev => prev.find(p => p.id === profile.id) ? prev : [...prev, profile]);

    const token = getAuthToken();
    if (!token) return;

    axios.get(`${API}conversa/${profile.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setMessagesByConv(prev => {
          const existingMsgs = prev[String(profile.id)] || [];
          const newMsgs = (res.data || []).map(msg => ({
            ...msg,
            senderName: msg.from === currentUserIdRef.current
              ? currentUserNameRef.current
              : msg.senderName || `Usuário ${msg.from}`
          }));

          const merged = [...existingMsgs, ...newMsgs].filter(
            (v, i, a) => a.findIndex(m => m.hora === v.hora && m.from === v.from) === i
          );

          const updated = { ...prev, [String(profile.id)]: merged };
          localStorage.setItem("messagesByConv", JSON.stringify(updated));
          return updated;
        });
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .catch(err => console.error("Erro ao carregar conversa:", err));
  };

  // 🔹 Verificação de login
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsLoggedIn(true);
      const decoded = parseJwt(token);
      currentUserIdRef.current = Number(decoded?.usuarioId ?? decoded?.id ?? decoded?.userId ?? decoded?.sub ?? 0);
      currentUserNameRef.current = decoded?.nome ?? decoded?.name ?? decoded?.username ?? decoded?.usuarioNome ?? "Você";

      if (location.state?.seller) startChatWith(location.state.seller);
      else {
        const fallback = localStorage.getItem('openChatWith');
        if (fallback) {
          startChatWith(JSON.parse(fallback));
          localStorage.removeItem('openChatWith');
        }
      }

      // Remove mensagens armazenadas que não envolvem o usuário atual
      const sanitizeStoredMessages = () => {
        try {
          const saved = localStorage.getItem('messagesByConv');
          if (!saved) return;
          const parsed = JSON.parse(saved);
          const filtered = {};
          Object.entries(parsed).forEach(([k, msgs]) => {
            const keep = (msgs || []).filter(m => Number(m.from) === currentUserIdRef.current || Number(m.to) === currentUserIdRef.current);
            if (keep.length) filtered[k] = keep;
          });
          localStorage.setItem('messagesByConv', JSON.stringify(filtered));
          setMessagesByConv(filtered);
        } catch (e) {}
      };

      sanitizeStoredMessages();

      loadConversationsOnLogin().catch(() => {});
    } else setIsLoggedIn(false);
  }, []);

  // 🔹 Carrega contatos que possuem mensagens e suas conversas para o usuário logado
  const loadConversationsOnLogin = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await axios.get(`${API}contatos-com-mensagens`, { headers: { Authorization: `Bearer ${token}` } });
      const contatos = res.data || [];

      setProfilesList(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const mapped = contatos.map(c => ({ id: c.usuarioId, name: c.nome, fotoPerfil: c.fotoPerfil, avatar: generateAvatar(c.nome) }));
        return [...prev, ...mapped.filter(m => !existingIds.has(m.id))];
      });

      await Promise.all(contatos.map(async (c) => {
        try {
          const convRes = await axios.get(`${API}conversa/${c.usuarioId}`, { headers: { Authorization: `Bearer ${token}` } });
          // Keep only messages that involve the current user
          const rawMsgs = convRes.data || [];
          const msgsFiltered = (rawMsgs || []).filter(m => Number(m.from) === currentUserIdRef.current || Number(m.to) === currentUserIdRef.current)
            .map(msg => ({
              ...msg,
              senderName: Number(msg.from) === currentUserIdRef.current ? currentUserNameRef.current : msg.senderName || `Usuário ${msg.from}`
            }));

          if (msgsFiltered.length) {
            setMessagesByConv(prev => {
              const key = String(c.usuarioId);
              const existing = prev[key] || [];
              const merged = [...existing, ...msgsFiltered].filter((v, i, a) => a.findIndex(m => m.hora === v.hora && m.from === v.from) === i);
              const updated = { ...prev, [key]: merged };
              localStorage.setItem('messagesByConv', JSON.stringify(updated));
              return updated;
            });
          }

          fetchUserDetails(c.usuarioId).catch(() => {});
        } catch {}
      }));
    } catch {}
  };

  // 🔹 Carregar contatos
  const loadContacts = async (endpoint) => {
    try {
      const res = await axios.get(`${API}${endpoint}`, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
      const mapped = (res.data || []).map(r => ({
        id: r.usuarioId,
        name: r.nome,
        fotoPerfil: r.fotoPerfil,
        avatar: generateAvatar(r.nome),
      }));
      setProfilesList(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        return [...prev, ...mapped.filter(c => !existingIds.has(c.id))];
      });
    } catch {}
  };
  useEffect(() => { loadContacts("contatos"); }, []);

  // 🔹 Socket
  useEffect(() => {
    const socket = io(API, { auth: { token: getAuthToken() } });
    socketRef.current = socket;

    socket.on("mensagem", async (msg) => {
      if (msg.from === currentUserIdRef.current) return;

      let senderName = msg.senderName;
      let senderProfile = profilesList.find(p => p.id === msg.from);

      if (!senderName) {
        const usuario = await fetchUserDetails(msg.from);
        senderName = usuario?.name || `Usuário ${msg.from}`;
        senderProfile = usuario || senderProfile;
      }

      const key = String(msg.from);
      setMessagesByConv(prev => {
        const existingMsgs = prev[key] || [];
        const merged = [...existingMsgs, { ...msg, senderName }]
          .filter((v, i, a) => a.findIndex(m => m.hora === v.hora && m.from === v.from) === i);
        const updated = { ...prev, [key]: merged };
        localStorage.setItem("messagesByConv", JSON.stringify(updated));
        return updated;
      });

      if (!profilesList.find(p => p.id === msg.from) && senderProfile) {
        setProfilesList(prev => [...prev, senderProfile]);
      }

      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    return () => socket.disconnect();
  }, [profilesList]);

  // 🔹 Enviar mensagem
  const enviarMensagem = () => {
    if (!inputText.trim() || !selectedProfile) return;

    const msg = {
      from: currentUserIdRef.current,
      to: selectedProfile.id,
      text: inputText,
      hora: new Date().toLocaleTimeString(),
      senderName: currentUserNameRef.current
    };

    socketRef.current?.emit("mensagem", msg);

    const key = String(selectedProfile.id);
    setMessagesByConv(prev => {
      const existingMsgs = prev[key] || [];
      const updated = { ...prev, [key]: [...existingMsgs, msg] };
      localStorage.setItem("messagesByConv", JSON.stringify(updated));
      return updated;
    });

    setInputText("");
  };

  const displayedMessages = selectedProfile ? messagesByConv[String(selectedProfile.id)] || [] : [];

  return (
    <div className="chats-page">
      <Navbar />
      {!isLoggedIn ? (
        <div className="not-logged-container with-icon">
          <div className="login-icon">💬</div>
          <h2>Você precisa estar logado para acessar o chat</h2>
          <button className="login-btn" onClick={() => navigate("/login")}>Fazer Login</button>
        </div>
      ) : (
        <div className="chats-container">
          <aside className="chats-sidebar">
            <div className="sidebar-header">
              <h2>Conversas</h2>
              <p className="sidebar-subtitle">Suas mensagens</p>
            </div>
            <div className="contact-list">
              {profilesList.filter(p => (messagesByConv[String(p.id)]?.length > 0) || (selectedProfile?.id === p.id)).map(profile => (
                <div key={profile.id}
                     className={`contact-item ${selectedProfile?.id === profile.id ? "active" : ""}`}
                     onClick={() => startChatWith(profile)}>
                  <div className="contact-avatar">
                    {profile.fotoPerfil ? (
                      <img src={`http://localhost:3000/uploads/${profile.fotoPerfil}`} alt={profile.name}
                           onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                    ) : null}
                    <div className="avatar-placeholder"
                         style={{ backgroundColor: profile.avatar?.color, display: profile.fotoPerfil ? "none" : "flex" }}>
                      {profile.avatar?.letter}
                    </div>
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{profile.name}</div>
                    <div className="last-message">
                      {messagesByConv[String(profile.id)]?.[messagesByConv[String(profile.id)].length - 1]?.text || "Nenhuma mensagem"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <main className="chat-main">
            <div className="chat-header">
              {selectedProfile ? (
                <div className="chat-profile">
                  <div className="chat-profile-info">
                    <div className="chat-profile-avatar">
                      {selectedProfile.fotoPerfil ? (
                        <img src={`http://localhost:3000/uploads/${selectedProfile.fotoPerfil}`} alt={selectedProfile.name} />
                      ) : null}
                      <div className="avatar-placeholder"
                           style={{ backgroundColor: selectedProfile.avatar?.color, display: selectedProfile.fotoPerfil ? "none" : "flex" }}>
                        {selectedProfile.avatar?.letter}
                      </div>
                    </div>
                    <div className="chat-profile-details">
                      <h2>{selectedProfile.name}</h2>
                      <span className="clickPerfil" onClick={() => navigate(`/perfil2/${selectedProfile.id}`)}>Ver perfil</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-chat-selected">
                  <h2>Selecione uma conversa</h2>
                  <p>Escolha um contato para começar a conversar</p>
                </div>
              )}
            </div>

            <div className="messages-container">
              {selectedProfile && (
                <>
                  {displayedMessages.map((msg, i) => (
                    <div key={i} className="message-group">
                      <div className={`message-item ${msg.from === currentUserIdRef.current ? "own-message" : "other-message"}`}>
                        <div className="message-bubble">
                          <div className="message-text">{msg.text}</div>
                          <div className="message-time">{msg.hora}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef}></div>
                </>
              )}
            </div>

            {selectedProfile && (
              <div className="chat-input-container">
                <input type="text" className="message-input"
                       placeholder={`Mensagem para ${selectedProfile.name}`}
                       value={inputText} onChange={e => setInputText(e.target.value)}
                       onKeyDown={e => e.key === "Enter" && enviarMensagem()} />
                <button className="send-btn" onClick={enviarMensagem} disabled={!inputText.trim()}>Enviar</button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

Chats.propTypes = { usuarioNome: PropTypes.string };
Chats.defaultProps = { usuarioNome: "Usuário" };

export default Chats;
