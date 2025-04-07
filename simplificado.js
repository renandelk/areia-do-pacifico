// Script simplificado para testar o acesso ao banco de dados e o servidor

// Importações necessárias
import express from 'express';
import { pool } from './server/db.js';
import cors from 'cors';

// Criar aplicação Express
const app = express();
app.use(express.json());
app.use(cors());

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando corretamente!' });
});

// Rota de teste para o banco de dados
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Conexão com o banco de dados funcionando!',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Erro na conexão com o banco de dados:', error);
    res.status(500).json({ 
      error: 'Erro ao conectar com o banco de dados',
      details: error.message
    });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});