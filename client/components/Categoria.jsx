import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const AnunciosCurso = () => {
  const { curso } = useParams();
  const [anuncios, setAnuncios] = useState([]);

  useEffect(() => {
    const fetchAnuncios = async () => {
      try {
        const res = await fetch(`http://localhost:3000/anuncios?curso=${encodeURIComponent(curso)}`);
        const data = await res.json();
        setAnuncios(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnuncios();
  }, [curso]);

  return (
    <div>
      <h1>Anúncios do curso: {curso}</h1>
      {anuncios.length === 0 && <p>Nenhum anúncio encontrado.</p>}
      {anuncios.map((a) => (
        <div key={a.anuncioId}>
          <h3>{a.nome}</h3>
          <p>{a.descricao}</p>
          <span>{a.preco}</span>
        </div>
      ))}
    </div>
  );
};

export default AnunciosCurso;
