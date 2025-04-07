// Script simples para testar a conexão com o PostgreSQL
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configurar WebSockets para Neon
const neonConfig = { webSocketConstructor: ws };

async function testConnection() {
  console.log('Verificando conexão com o banco de dados...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    console.error('ERRO: DATABASE_URL não está definida!');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query('SELECT NOW() as now');
    console.log('Conexão bem-sucedida!');
    console.log('Hora do servidor:', result.rows[0].now);
    await pool.end();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
    console.error('Stack:', error.stack);
  }
}

testConnection();