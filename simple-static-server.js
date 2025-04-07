// Servidor Express para servir arquivos estáticos
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtém o diretório atual do arquivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar aplicação Express
const app = express();

// Servir arquivos estáticos da pasta /public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rota de fallback para SPA (Single Page Application)
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor estático rodando em http://0.0.0.0:${PORT}`);
  console.log(`Servindo arquivos da pasta: ${path.join(__dirname, 'public')}`);
});