// Servidor WebSocket simples usando módulos do Node.js
const http = require('http');
const fs = require('fs');
const path = require('path');

// Criar servidor HTTP
const server = http.createServer((req, res) => {
  console.log(`Requisição recebida: ${req.url}`);
  
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cliente WebSocket Simples</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          #messages { height: 300px; border: 1px solid #ccc; margin-bottom: 10px; padding: 10px; overflow-y: auto; }
          .message { margin-bottom: 8px; padding: 8px; border-radius: 4px; }
          .system { background-color: #f0f0f0; }
          .broadcast { background-color: #e3f2fd; }
          .error { background-color: #ffebee; color: #c62828; }
          input, button { padding: 8px; margin-top: 10px; }
          input { width: 70%; }
          button { background-color: #2196F3; color: white; border: none; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Cliente WebSocket Simples</h1>
        <div id="messages"></div>
        <input type="text" id="messageInput" placeholder="Digite sua mensagem">
        <button id="sendBtn">Enviar</button>

        <script>
          const messagesDiv = document.getElementById('messages');
          const messageInput = document.getElementById('messageInput');
          const sendBtn = document.getElementById('sendBtn');
          
          function addMessage(type, content) {
            const messageElem = document.createElement('div');
            messageElem.className = 'message ' + type;
            messageElem.textContent = content;
            messagesDiv.appendChild(messageElem);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          }
          
          // Conectar ao servidor WebSocket
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = \`\${protocol}//\${window.location.host}/ws\`;
          
          addMessage('system', 'Conectando ao servidor...');
          
          let socket;
          try {
            socket = new WebSocket(wsUrl);
            
            // Evento de conexão estabelecida
            socket.onopen = () => {
              addMessage('system', 'Conectado ao servidor WebSocket');
            };
            
            // Evento de recebimento de mensagem
            socket.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'broadcast') {
                  addMessage('broadcast', \`\${data.sender}: \${data.content}\`);
                } else {
                  addMessage('system', data.content || event.data);
                }
              } catch (e) {
                addMessage('system', event.data);
              }
            };
            
            // Evento de erro na conexão
            socket.onerror = (error) => {
              addMessage('error', 'Erro na conexão WebSocket');
              console.error('Erro WebSocket:', error);
            };
            
            // Evento de fechamento da conexão
            socket.onclose = () => {
              addMessage('system', 'Desconectado do servidor WebSocket');
            };
          } catch (error) {
            addMessage('error', 'Falha ao criar conexão WebSocket: ' + error.message);
          }
          
          // Função para enviar mensagem
          function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;
            
            if (socket && socket.readyState === WebSocket.OPEN) {
              try {
                socket.send(JSON.stringify({
                  username: 'Usuário',
                  content: message
                }));
                messageInput.value = '';
              } catch (e) {
                addMessage('error', 'Erro ao enviar mensagem: ' + e.message);
              }
            } else {
              addMessage('error', 'Não conectado ao servidor');
            }
          }
          
          // Adicionar event listeners
          sendBtn.addEventListener('click', sendMessage);
          messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          });
        </script>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Página não encontrada');
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor HTTP rodando em http://0.0.0.0:${PORT}`);
  
  // Configurar WebSocket Server manualmente
  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      handleWebSocketConnection(request, socket, head);
    } else {
      socket.destroy();
    }
  });
});

// Lista de conexões WebSocket ativas
const clients = [];

// Função para lidar com conexões WebSocket
function handleWebSocketConnection(request, socket, head) {
  console.log('Nova conexão WebSocket recebida');
  
  // Realizar handshake WebSocket
  const key = request.headers['sec-websocket-key'];
  const hash = generateAcceptValue(key);
  
  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${hash}`,
    '',
    ''
  ];
  
  socket.write(headers.join('\r\n'));
  
  // Criar objeto para representar o cliente WebSocket
  const client = {
    socket: socket,
    send: function(data) {
      try {
        const framedData = frameData(data);
        socket.write(framedData);
      } catch (e) {
        console.error('Erro ao enviar mensagem:', e);
      }
    }
  };
  
  // Adicionar cliente à lista
  clients.push(client);
  
  // Enviar mensagem de boas-vindas
  client.send(JSON.stringify({
    type: 'message',
    content: 'Bem-vindo ao servidor WebSocket!'
  }));
  
  // Configurar tratamento de dados
  let buffer = Buffer.alloc(0);
  
  socket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);
    
    // Processar frames completos
    let frame = decodeFrame(buffer);
    
    while (frame) {
      if (frame.opcode === 8) {
        // Close frame
        socket.end();
        return;
      }
      
      if (frame.opcode === 1) {
        // Text frame
        const message = frame.payload.toString('utf8');
        console.log('Mensagem recebida:', message);
        
        try {
          const parsedMessage = JSON.parse(message);
          
          // Broadcast para todos os clientes
          const broadcastMessage = JSON.stringify({
            type: 'broadcast',
            sender: parsedMessage.username || 'Anônimo',
            content: parsedMessage.content
          });
          
          clients.forEach(c => {
            if (c.socket && c.socket !== socket) {
              c.send(broadcastMessage);
            }
          });
          
          // Confirmar recebimento para o remetente
          client.send(JSON.stringify({
            type: 'message',
            content: `Mensagem enviada: ${parsedMessage.content}`
          }));
        } catch (e) {
          console.error('Erro ao processar mensagem:', e);
        }
      }
      
      // Remover frame processado do buffer
      buffer = buffer.slice(frame.totalLength);
      
      // Verificar se há mais frames completos
      frame = decodeFrame(buffer);
    }
  });
  
  // Lidar com fechamento da conexão
  socket.on('end', () => closeConnection());
  socket.on('close', () => closeConnection());
  socket.on('error', (error) => {
    console.error('Erro na conexão WebSocket:', error);
    closeConnection();
  });
  
  // Função para limpar recursos quando a conexão é fechada
  function closeConnection() {
    const index = clients.findIndex(c => c.socket === socket);
    if (index !== -1) {
      clients.splice(index, 1);
      console.log('Cliente WebSocket desconectado');
    }
  }
}

// Função para gerar o valor Sec-WebSocket-Accept
function generateAcceptValue(key) {
  const crypto = require('crypto');
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const hash = crypto.createHash('sha1')
    .update(key + GUID)
    .digest('base64');
  return hash;
}

// Função para decodificar frames WebSocket
function decodeFrame(buffer) {
  if (buffer.length < 2) return null;
  
  const firstByte = buffer[0];
  const secondByte = buffer[1];
  
  const fin = Boolean(firstByte & 0x80);
  const opcode = firstByte & 0x0F;
  const masked = Boolean(secondByte & 0x80);
  let payloadLength = secondByte & 0x7F;
  
  let offset = 2;
  
  if (payloadLength === 126) {
    if (buffer.length < 4) return null;
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return null;
    payloadLength = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }
  
  let maskingKey;
  if (masked) {
    if (buffer.length < offset + 4) return null;
    maskingKey = buffer.slice(offset, offset + 4);
    offset += 4;
  }
  
  if (buffer.length < offset + payloadLength) return null;
  
  let payload = buffer.slice(offset, offset + payloadLength);
  
  if (masked) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] = payload[i] ^ maskingKey[i % 4];
    }
  }
  
  return {
    fin,
    opcode,
    masked,
    payloadLength,
    payload,
    totalLength: offset + payloadLength
  };
}

// Função para criar frames WebSocket
function frameData(data) {
  if (typeof data === 'string') {
    data = Buffer.from(data, 'utf8');
  }
  
  const payloadLength = data.length;
  
  let headerLength = 2;
  if (payloadLength > 65535) {
    headerLength = 10;
  } else if (payloadLength > 125) {
    headerLength = 4;
  }
  
  const frame = Buffer.alloc(headerLength + payloadLength);
  
  // Byte 1: FIN (1), RSV (000), Opcode (0001 = text)
  frame[0] = 0x81;
  
  // Byte 2: MASK (0), Payload length
  if (payloadLength <= 125) {
    frame[1] = payloadLength;
  } else if (payloadLength <= 65535) {
    frame[1] = 126;
    frame.writeUInt16BE(payloadLength, 2);
  } else {
    frame[1] = 127;
    frame.writeBigUInt64BE(BigInt(payloadLength), 2);
  }
  
  // Copia os dados
  data.copy(frame, headerLength);
  
  return frame;
}