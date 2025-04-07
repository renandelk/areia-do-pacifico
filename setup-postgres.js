// Script para ajudar na instalação e configuração do PostgreSQL
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

console.log('======= Assistente de Configuração do PostgreSQL =======');
console.log('Este script ajudará você a configurar o PostgreSQL local');

try {
  // Verifica se o PostgreSQL está instalado
  console.log('\n[1] Verificando se o PostgreSQL está instalado...');
  
  try {
    execSync('where psql', { stdio: 'ignore' });
    console.log('✅ PostgreSQL já está instalado no sistema!');
  } catch (e) {
    console.log('❌ PostgreSQL não encontrado!');
    console.log('\n[2] Instruções para instalar o PostgreSQL:');
    console.log('   1. Acesse: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads');
    console.log('   2. Baixe o instalador para Windows x64');
    console.log('   3. Execute o instalador e siga as instruções');
    console.log('   4. IMPORTANTE: Anote a senha que você definir para o usuário postgres');
    console.log('   5. Mantenha a porta padrão 5432');
    console.log('   6. Complete a instalação e volte a executar este script');
    process.exit(1);
  }
  
  // Ajuda a configurar a variável DATABASE_URL
  console.log('\n[3] Configuração do banco de dados:');
  console.log('   Execute estes comandos no SQL Shell (psql) ou no CMD:');
  console.log('\n   1. Conecte-se como usuário postgres:');
  console.log('      psql -U postgres');
  console.log('\n   2. Crie o banco de dados:');
  console.log('      CREATE DATABASE areiadomar;');
  console.log('\n   3. Verifique se o banco foi criado:');
  console.log('      \\l');
  console.log('\n   4. Saia do psql:');
  console.log('      \\q');
  
  // Atualiza o arquivo .env com as instruções
  const envPath = path.join(process.cwd(), '.env');
  let envContent = `VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-fe03bc36-a296-4fd2-9bb4-26ffce717aed
MERCADOPAGO_ACCESS_TOKEN=APP_USR-5458216658215763-032913-1b6d9fe1e3790ac48a1ae169435cc9bf-2357348115
MERCADOPAGO_CLIENT_ID=5458216658215763
MERCADOPAGO_CLIENT_SECRET=9vwB5Z5J8p4SMB2usIKlqLmMg6gR7vpg
DATABASE_URL=postgres://postgres:SUASENHA@localhost:5432/areiadomar

# IMPORTANTE: Substitua SUASENHA pela senha que você definiu para o usuário postgres
# durante a instalação do PostgreSQL
`;

  console.log('\n[4] Atualizando arquivo .env com as instruções...');
  writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env atualizado!');
  
  console.log('\n======= PRÓXIMOS PASSOS =======');
  console.log('1. Edite o arquivo .env e substitua SUASENHA pela senha do PostgreSQL');
  console.log('2. Crie o banco de dados "areiadomar" conforme as instruções acima');
  console.log('3. Execute npm run dev para iniciar o projeto');
  
} catch (error) {
  console.error('Erro durante a configuração:', error);
} 