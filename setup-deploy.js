#!/usr/bin/env node
// Script para configurar o ambiente e preparar para deploy
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Executa um comando e retorna uma promessa
function execCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executando: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar comando: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log(`Stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Função principal
async function setupDeploy() {
  console.log('🚀 Iniciando setup para deploy...');

  try {
    // Passo 1: Verificar se temos o package.json
    if (!fs.existsSync('./package.json')) {
      console.error('❌ Arquivo package.json não encontrado!');
      return;
    }

    // Passo 2: Executar build
    console.log('📦 Executando build...');
    await execCommand('npm run build');
    
    // Passo 3: Verificar se o build foi gerado corretamente
    if (!fs.existsSync('./build') || !fs.existsSync('./build/simplified-server.js')) {
      console.error('❌ Build não foi gerado corretamente!');
      return;
    }
    
    // Passo 4: Verificar se temos o diretório public no build
    if (!fs.existsSync('./build/public')) {
      console.log('📁 Criando diretório build/public...');
      fs.mkdirSync('./build/public', { recursive: true });
    }
    
    // Passo 5: Verificar se temos arquivos no public
    if (fs.existsSync('./public') && fs.readdirSync('./public').length > 0) {
      console.log('📂 Copiando arquivos de public para build/public...');
      fs.cpSync('./public', './build/public', { recursive: true });
    }
    
    // Passo 6: Verificar se temos o build do frontend em dist/public
    if (fs.existsSync('./dist/public')) {
      console.log('📂 Copiando arquivos de dist/public para build/public...');
      fs.cpSync('./dist/public', './build/public', { recursive: true });
    }
    
    // Passo 7: Criar um arquivo de verificação
    console.log('📝 Criando arquivo de verificação...');
    fs.writeFileSync('./build/deploy-ready.txt', `Deploy preparado em ${new Date().toISOString()}`);
    
    // Passo 8: Verificar conteúdo final
    console.log('🔍 Verificando conteúdo final:');
    console.log(`Arquivos em build: ${fs.readdirSync('./build').join(', ')}`);
    console.log(`Arquivos em build/public: ${fs.readdirSync('./build/public').join(', ')}`);
    
    console.log('✅ Setup para deploy concluído com sucesso!');
  } catch (error) {
    console.error(`❌ Erro durante o setup: ${error.message}`);
  }
}

// Executar a função principal
setupDeploy();