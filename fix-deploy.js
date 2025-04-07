#!/usr/bin/env node
// Script para corrigir a estrutura de diretórios para deploy
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para verificar se um caminho existe
function checkPathExists(p) {
  try {
    return fs.existsSync(p);
  } catch (error) {
    return false;
  }
}

// Principais diretórios que precisamos verificar
const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const distPublicDir = path.join(distDir, 'public');
const buildDir = path.join(rootDir, 'build');

console.log('📁 Verificando diretórios para deploy...');
console.log(`Root: ${rootDir}`);
console.log(`dist: ${distDir} - ${checkPathExists(distDir) ? '✅ existe' : '❌ não existe'}`);
console.log(`public: ${publicDir} - ${checkPathExists(publicDir) ? '✅ existe' : '❌ não existe'}`);
console.log(`dist/public: ${distPublicDir} - ${checkPathExists(distPublicDir) ? '✅ existe' : '❌ não existe'}`);
console.log(`build: ${buildDir} - ${checkPathExists(buildDir) ? '✅ existe' : '❌ não existe'}`);

// Verificar se o arquivo index.html existe no diretório público
const indexHtmlDist = path.join(distPublicDir, 'index.html');
const indexHtmlPublic = path.join(publicDir, 'index.html');
const indexHtmlBuild = path.join(buildDir, 'public', 'index.html');

console.log(`\n📄 Verificando arquivos index.html:`);
console.log(`dist/public/index.html: ${checkPathExists(indexHtmlDist) ? '✅ existe' : '❌ não existe'}`);
console.log(`public/index.html: ${checkPathExists(indexHtmlPublic) ? '✅ existe' : '❌ não existe'}`);
console.log(`build/public/index.html: ${checkPathExists(indexHtmlBuild) ? '✅ existe' : '❌ não existe'}`);

// Ajustar o caminho para servir os arquivos estáticos
// Vamos tentar várias possíveis soluções

// 1. Verificar se precisamos criar o diretório build/public
if (!checkPathExists(path.join(buildDir, 'public')) && checkPathExists(publicDir)) {
  console.log('\n🔧 Criando diretório build/public e copiando arquivos...');
  try {
    fs.mkdirSync(path.join(buildDir, 'public'), { recursive: true });
    fs.cpSync(publicDir, path.join(buildDir, 'public'), { recursive: true });
    console.log('✅ Arquivos copiados de public para build/public');
  } catch (error) {
    console.error('❌ Erro ao copiar arquivos:', error);
  }
}

// 2. Criar symbolic link se necessário
if (checkPathExists(distDir) && !checkPathExists(path.join(distDir, 'public')) && checkPathExists(publicDir)) {
  console.log('\n🔗 Criando symbolic link de public para dist/public...');
  try {
    fs.symlinkSync(publicDir, path.join(distDir, 'public'), 'dir');
    console.log('✅ Symbolic link criado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar symbolic link:', error);
    
    // Se falhar, tentar copiar os arquivos diretamente
    try {
      console.log('🔄 Tentando copiar arquivos em vez de criar symbolic link...');
      fs.mkdirSync(path.join(distDir, 'public'), { recursive: true });
      fs.cpSync(publicDir, path.join(distDir, 'public'), { recursive: true });
      console.log('✅ Arquivos copiados de public para dist/public');
    } catch (copyError) {
      console.error('❌ Erro ao copiar arquivos:', copyError);
    }
  }
}

// 3. Verificar estrutura final e mostrar recomendações
console.log('\n🔍 Verificação final dos diretórios:');
console.log(`dist/public: ${checkPathExists(path.join(distDir, 'public')) ? '✅ existe' : '❌ não existe'}`);
console.log(`build/public: ${checkPathExists(path.join(buildDir, 'public')) ? '✅ existe' : '❌ não existe'}`);

// Sugerir modificações para simplified-server.js se necessário
console.log('\n💡 Recomendações para o servidor:');
if (checkPathExists(path.join(buildDir, 'public'))) {
  console.log('✅ Use path.join(__dirname, "public") no simplified-server.js');
} else if (checkPathExists(path.join(distDir, 'public'))) {
  console.log('✅ Use path.join(__dirname, "..", "dist", "public") no simplified-server.js');
} else if (checkPathExists(publicDir)) {
  console.log('✅ Use path.join(__dirname, "..", "public") no simplified-server.js');
} else {
  console.log('❌ Não foi possível encontrar um diretório público válido.');
}

console.log('\n📝 Script de verificação concluído.');