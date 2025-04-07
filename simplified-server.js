const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas as origens
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta client/dist após o build
app.use(express.static(path.join(__dirname, 'client/dist')));

// Endpoint para obter produtos
app.get('/api/products', (req, res) => {
  try {
    const productsData = fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf8');
    const products = JSON.parse(productsData);

    // Adicionar delay para simular rede (opcional)
    setTimeout(() => {
      res.json(products);
    }, 200);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ 
      error: 'Erro ao carregar produtos', 
      message: error.message 
    });
  }
});

// Endpoint para obter categorias
app.get('/api/categories', (req, res) => {
  try {
    const categoriesData = fs.readFileSync(path.join(__dirname, 'data/categories.json'), 'utf8');
    const categories = JSON.parse(categoriesData);
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ 
      error: 'Erro ao carregar categorias', 
      message: error.message 
    });
  }
});

// Endpoint para obter um produto específico por ID
app.get('/api/products/:id', (req, res) => {
  try {
    const productsData = fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf8');
    const products = JSON.parse(productsData);
    const product = products.find(p => p.id.toString() === req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ 
      error: 'Erro ao carregar o produto', 
      message: error.message 
    });
  }
});

// Rota de fallback para SPA - redireciona todas as outras rotas para o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
});