import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

// Tentar ler o arquivo .env manualmente
let envVars = {};
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
      envVars[parts[0].trim()] = parts[1].trim();
    }
  });
  console.log("Variáveis de ambiente lidas do arquivo .env");
} catch (error) {
  console.error("Não foi possível ler o arquivo .env:", error.message);
}

// Usar DATABASE_URL do arquivo .env
let connectionString = envVars['DATABASE_URL'];
console.log("DATABASE_URL do arquivo .env:", connectionString);

// Usar DATABASE_URL do Replit (via variáveis PG*)
if (!connectionString) {
  try {
    // Ler as variáveis do filesystem para testar
    const pgHost = process.env.PGHOST || envVars['PGHOST'];
    const pgUser = process.env.PGUSER || envVars['PGUSER'];
    const pgPassword = process.env.PGPASSWORD || envVars['PGPASSWORD'];
    const pgDatabase = process.env.PGDATABASE || envVars['PGDATABASE'];
    const pgPort = process.env.PGPORT || envVars['PGPORT'] || '5432';
    
    if (pgHost && pgUser && pgDatabase) {
      const credentials = pgPassword ? `${pgUser}:${pgPassword}` : pgUser;
      connectionString = `postgresql://${credentials}@${pgHost}:${pgPort}/${pgDatabase}`;
      console.log("Conexão construída a partir de variáveis PG:", connectionString);
    }
  } catch (error) {
    console.error("Erro ao construir string de conexão:", error.message);
  }
}

// Se ainda não tiver encontrado, usar o valor padrão para teste local
if (!connectionString) {
  connectionString = 'postgresql://postgres:postgres@localhost:5432/ecommerce';
  console.log("Usando string de conexão fixa para teste:", connectionString);
}

async function testConnection() {
  try {
    console.log("Tentando conectar ao PostgreSQL usando:", connectionString);
    const pool = new Pool({ connectionString });
    const client = await pool.connect();
    console.log("✅ Conexão ao PostgreSQL bem-sucedida!");
    
    // Executar uma consulta simples
    const result = await client.query('SELECT current_timestamp as time');
    console.log("🕒 Resultado da consulta:", result.rows[0]);
    
    client.release();
    await pool.end();
    
    console.log("✨ Teste concluído com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error.message);
    console.error("Tentou conectar em:", connectionString);
    process.exit(1);
  }
}

testConnection();