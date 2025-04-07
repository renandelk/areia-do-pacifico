import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// Criar servidor HTTP
const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Servidor WebSocket rodando!\n');
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
});