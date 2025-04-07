# Exemplo de WebSocket em JavaScript

Este é um exemplo simples que demonstra como implementar uma comunicação em tempo real usando WebSocket com JavaScript tanto no lado do servidor quanto no cliente.

## Arquivos Incluídos

- `websocket-example-server.js` - Código do servidor WebSocket usando a biblioteca `ws`
- `websocket-example-client.html` - Página HTML com cliente WebSocket
- `run-websocket-example.js` - Script simplificado que serve o cliente HTML e inicia o servidor WebSocket

## Como Executar

1. Certifique-se de ter Node.js instalado (v14 ou superior)
2. Execute o script principal:
   ```
   node run-websocket-example.js
   ```
   ou usando o caminho completo para o Node.js:
   ```
   /mnt/nixmodules/nix/store/5qsvgakh44n1akfjjfjizwaynr7vd2sy-nodejs-18.20.5-wrapped/bin/node run-websocket-example.js
   ```
3. Abra seu navegador e acesse `http://localhost:3000`
4. Digite seu nome, escreva uma mensagem e clique em "Enviar"
5. Abra outra aba ou janela do navegador com a mesma URL para ver a comunicação em tempo real

## Funcionalidades Demonstradas

- Configuração de servidor WebSocket no backend usando `ws`
- Integração do servidor WebSocket com servidor HTTP
- Conexão WebSocket no cliente usando a API nativa do navegador
- Troca de mensagens em tempo real
- Gerenciamento de conexões de clientes
- Tratamento de erros e eventos de conexão

## Conceitos Importantes

### Iniciando o Servidor

```javascript
// Configurar WebSocket Server no caminho /ws
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
```

### Conectando do Cliente para o Servidor

```javascript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/ws`;
socket = new WebSocket(wsUrl);
```

### Verificando o Estado da Conexão

```javascript
if (socket.readyState === WebSocket.OPEN) {
  // A conexão está aberta e pronta para comunicação
}
```

### Enviando Mensagens

Servidor para cliente:
```javascript
ws.send(JSON.stringify({
  type: 'message',
  content: 'Bem-vindo ao servidor WebSocket!',
  timestamp: new Date().toISOString()
}));
```

Cliente para servidor:
```javascript
socket.send(JSON.stringify({
  username: 'Nome do usuário',
  content: 'Conteúdo da mensagem'
}));
```

### Tratando Eventos

No servidor:
```javascript
wss.on('connection', (ws) => {
  // Nova conexão
  
  ws.on('message', (message) => {
    // Mensagem recebida
  });
  
  ws.on('close', () => {
    // Conexão fechada
  });
  
  ws.on('error', (error) => {
    // Erro na conexão
  });
});
```

No cliente:
```javascript
socket.onopen = () => {
  // Conexão estabelecida
};

socket.onmessage = (event) => {
  // Mensagem recebida
};

socket.onclose = () => {
  // Conexão fechada
};

socket.onerror = (error) => {
  // Erro na conexão
};
```

## Recomendações para Uso em Produção

- Implemente autenticação e autorização
- Adicione reconexão automática no cliente
- Considere usar heartbeats para detectar conexões inativas
- Implemente rate limiting para prevenir abuso
- Use SSL/TLS (wss://) em produção
- Considere usar biblioteca como Socket.IO para funcionalidades mais avançadas e melhor compatibilidade entre navegadores

## Recursos Adicionais

- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Documentação da biblioteca ws](https://github.com/websockets/ws)
- [RFC 6455 - WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)