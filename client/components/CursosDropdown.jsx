import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CursosDropdown = () => {
  const [cursos, setCursos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await fetch("http://localhost:3000/cursos");
        const data = await res.json();
        setCursos(data.cursos || []);
      } catch (err) {
        console.error("Erro ao buscar cursos:", err);
        setCursos([]);
      }
    };
    fetchCursos();
  }, []);

  const handleSelect = (cursoNome) => {
    if (!cursoNome) return;
    navigate(`/buscar?curso=${encodeURIComponent(cursoNome)}`);
  };

  return (
    <div className="cursos-dropdown-content">
      <h3>Cursos</h3>
      <div className="cursos-list">
        {cursos.map((curso, index) => (
          <div
            key={index}
            className="curso-item"
            onClick={() => handleSelect(curso)}
          >
            {curso}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CursosDropdown;