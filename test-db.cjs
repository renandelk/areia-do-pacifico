const { Pool } = require('pg');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

console.log("Testando conexão com o banco de dados PostgreSQL");
console.log("DATABASE_URL:", process.env.DATABASE_URL || "Não definido");
console.log("PGHOST:", process.env.PGHOST || "Não definido");
console.log("PGUSER:", process.env.PGUSER || "Não definido");
console.log("PGDATABASE:", process.env.PGDATABASE || "Não definido");
console.log("PGPORT:", process.env.PGPORT || "Não definido");

// Primeira tentativa: usar DATABASE_URL
let connectionString = process.env.DATABASE_URL;

// Segunda tentativa: construir a partir de variáveis PG*
if (!connectionString && process.env.PGUSER && process.env.PGHOST && process.env.PGDATABASE) {
  const userPass = process.env.PGPASSWORD ? `${process.env.PGUSER}:${process.env.PGPASSWORD}` : process.env.PGUSER;
  const port = process.env.PGPORT || 5432;
  connectionString = `postgresql://${userPass}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  console.log("Conexão construída a partir de variáveis PG*:", connectionString);
}

// Terceira tentativa: usar uma string hardcoded para teste
if (!connectionString) {
  connectionString = 'postgresql://postgres:postgres@localhost:5432/ecommerce';
  console.log("Usando string de conexão fixa para teste:", connectionString);
}

async function testConnection() {
  try {
    console.log("Tentando conectar usando string:", connectionString);
    const pool = new Pool({ connectionString });
    const client = await pool.connect();
    console.log("Conexão bem-sucedida!");
    
    // Executar uma consulta simples
    const result = await client.query('SELECT current_timestamp as time');
    console.log("Resultado da consulta:", result.rows[0]);
    
    client.release();
    await pool.end();
    
    console.log("Teste concluído com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

testConnection();