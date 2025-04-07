// Script para iniciar o servidor
import { exec } from 'child_process';

console.log('Iniciando o servidor com ambiente personalizado...');

// Função para executar comandos
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executando: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      
      console.log(`Stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Sequência de comandos
async function start() {
  try {
    // Verificar a versão do Node.js
    await executeCommand('node --version');
    
    // Verificar a versão do npm
    await executeCommand('npm --version');
    
    // Iniciar o servidor
    console.log('Iniciando o servidor...');
    await executeCommand('npm run dev');
  } catch (error) {
    console.error('Falha ao iniciar o servidor:', error);
  }
}

// Iniciar
start();