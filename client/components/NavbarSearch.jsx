import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdSearch } from "react-icons/io";

const NavbarSearch = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/buscar?q=${encodeURIComponent(q)}`);
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Procurar perfis e anuncios..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit"><IoMdSearch className="search-icon" /></button>
    </form>
  );
};

export default NavbarSearch;
