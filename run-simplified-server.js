// Script para iniciar o servidor simplificado
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Iniciando servidor simplificado...');

// Verificar se o arquivo schema.js existe
const schemaPath = path.join(__dirname, 'shared', 'schema.js');
if (!fs.existsSync(schemaPath)) {
  console.log('Criando arquivo schema.js...');
  fs.mkdirSync(path.join(__dirname, 'shared'), { recursive: true });
  
  // Criar o arquivo schema.js
  fs.writeFileSync(schemaPath, 
    `// Auto-generated from schema.ts\n` + 
    `import { z } from 'zod';\n\n` +
    `// Login schema for admin authentication\n` +
    `export const loginSchema = z.object({\n` +
    `  username: z.string().min(1).max(50),\n` +
    `  password: z.string().min(1),\n` +
    `});\n`
  );
  
  console.log('Arquivo schema.js criado com sucesso!');
}

// Verificar o diretório dist/public
const publicDir = path.join(__dirname, 'dist', 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Criando diretório dist/public...');
  fs.mkdirSync(publicDir, { recursive: true });
  
  // Copiar arquivos do diretório public para dist/public, se existir
  const srcPublicDir = path.join(__dirname, 'public');
  if (fs.existsSync(srcPublicDir)) {
    console.log('Copiando arquivos de public para dist/public...');
    
    // Função para copiar diretório recursivamente
    const copyDir = (src, dest) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    copyDir(srcPublicDir, publicDir);
    console.log('Arquivos copiados com sucesso!');
  }
}

// Iniciar o servidor simplificado
console.log('Iniciando servidor...');
process.env.PORT = process.env.PORT || '5000';

// Encontrar o caminho do executável do Node.js
let nodePath = 'node';
// Verificar se o Node.js está disponível no caminho padrão do Nix
const nixNodePath = '/mnt/nixmodules/nix/store/0l5yh0rdzibk8arj9c8gzy1570jkc3vf-nodejs-16.18.1/bin/node';
if (fs.existsSync(nixNodePath)) {
  nodePath = nixNodePath;
  console.log(`Usando Node.js em: ${nodePath}`);
}

// Iniciar o servidor como um processo filho
const server = spawn(nodePath, ['simplified-server.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

// Manipular eventos do processo
server.on('close', (code) => {
  console.log(`Servidor encerrado com código: ${code}`);
});

server.on('error', (err) => {
  console.error(`Erro ao iniciar servidor: ${err.message}`);
});