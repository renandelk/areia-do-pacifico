// Este script simplifica a configuração para executar o exemplo de WebSocket

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Criar servidor HTTP
const httpServer = createServer((req, res) => {
  console.log(`Requisição recebida: ${req.url}`);
  
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const htmlContent = readFileSync(join(__dirname, 'websocket-example-client.html'), 'utf8');
    res.end(htmlContent);
  } else {
    res.writeHead(404);
    res.end('Página não encontrada');
  }
});

// Configurar WebSocket Server no caminho /ws
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

// Array para armazenar conexões ativas
const clients = [];

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  
  // Adicionar cliente à lista
  clients.push(ws);
  
  // Enviar mensagem de boas-vindas
  ws.send(JSON.stringify({
    type: 'message',
    content: 'Bem-vindo ao servidor WebSocket!',
    timestamp: new Date().toISOString()
  }));

  // Lidar com mensagens recebidas
  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message.toString());
    
    try {
      const data = JSON.parse(message.toString());
      
      // Broadcast da mensagem para todos os clientes
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'broadcast',
            sender: data.username || 'Anônimo',
            content: data.content,
            timestamp: new Date().toISOString()
          }));
        }
      });
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });

  // Lidar com desconexão
  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
    // Remover cliente da lista
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
  
  // Lidar com erros
  ws.on('error', (error) => {
    console.error('Erro na conexão WebSocket:', error);
  });
});

// Iniciar servidor na porta 3000
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`WebSocket disponível em ws://0.0.0.0:${PORT}/ws`);
  console.log(`Abra seu navegador e acesse http://localhost:${PORT} para testar o cliente WebSocket`);
});