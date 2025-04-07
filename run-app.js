import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Resolver o caminho do diretório atual
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Verificar se DATABASE_URL já está definida (pelo Replit)
if (process.env.DATABASE_URL) {
  console.log('Usando DATABASE_URL fornecida pelo ambiente Replit');
} else {
  console.error('ERRO: DATABASE_URL não está definida no ambiente!');
  console.error('Execute "check_database_status" para verificar o status do banco de dados.');
  process.exit(1);
}

// Iniciar o servidor usando tsx
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Manipular sinais para encerrar adequadamente
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down server...');
  server.kill('SIGTERM');
});