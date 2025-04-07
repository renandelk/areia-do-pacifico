// Servidor HTTP simples para servir os arquivos estáticos HTML
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual com suporte a ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Mapeamento de extensões de arquivo para tipos MIME
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Função para obter o tipo MIME com base na extensão do arquivo
function getMimeType(filePath) {
  const ext = path.extname(filePath);
  return mimeTypes[ext] || 'text/plain';
}

// Criar servidor HTTP
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Redirecionar a raiz para a página de login de administrador
  if (req.url === '/' || req.url === '/index.html') {
    req.url = '/admin-login.html';
  }
  
  // Manejar rotas para as páginas HTML estáticas
  if (req.url === '/admin-login.html' || req.url === '/admin-dashboard.html') {
    const filePath = path.join(__dirname, req.url);
    
    // Verificar se o arquivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`Arquivo não encontrado: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Página não encontrada</h1>');
        return;
      }
      
      // Ler e servir o arquivo
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error(`Erro ao ler arquivo: ${filePath}`, err);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>500 - Erro interno do servidor</h1>');
          return;
        }
        
        const mimeType = getMimeType(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(content);
      });
    });
  } 
  // Rota para API de login
  else if (req.method === 'POST' && req.url === '/api/auth/admin-login') {
    let data = '';
    
    req.on('data', chunk => {
      data += chunk;
    });
    
    req.on('end', () => {
      try {
        const credentials = JSON.parse(data);
        console.log('Tentativa de login:', credentials.username);
        
        // Verificar credenciais hardcoded (apenas para demonstração)
        if (credentials.username === 'renan1' && credentials.password === 'Familia@1') {
          console.log('Login bem-sucedido');
          
          // Criar uma resposta similar à resposta de login da API real
          const response = {
            id: 1,
            username: 'renan1',
            email: 'admin@areiadopacifico.com',
            role: 'admin',
            name: 'Administrador',
            success: true,
            sessionId: 'demo-session-' + Date.now(),
            timestamp: new Date().toISOString()
          };
          
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Set-Cookie': `adminSession=${response.sessionId}; Path=/; HttpOnly; SameSite=Lax`
          });
          
          res.end(JSON.stringify(response));
        } else {
          console.log('Credenciais inválidas');
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Credenciais administrativas inválidas' }));
        }
      } catch (error) {
        console.error('Erro ao processar login:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Requisição inválida' }));
      }
    });
  }
  // Para quaisquer outras rotas, retornar 404
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Página não encontrada</h1>');
  }
});

// Iniciar o servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado em http://0.0.0.0:${PORT}`);
  console.log(`Acesse a interface administrativa em http://0.0.0.0:${PORT}/admin-login.html`);
  console.log('Credenciais de acesso: renan1 / Familia@1');
});