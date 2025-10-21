app.get('/categorias', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT categoriaID, nome FROM categoria ORDER BY nome');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar categorias', error: err.message });
  }
});

app.get('/anuncios/categoria/:categoriaId', async (req, res) => {
  const { categoriaId } = req.params;
  try {
    const [rows] = await db.execute(
      'SELECT * FROM anuncio WHERE categoriaID = ? ORDER BY dataPublicacao DESC',
      [categoriaId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar anúncios por categoria', error: err.message });
  }
});
