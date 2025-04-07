import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Configurações do servidor
const PORT = process.env.PORT || 3000;

// Substitui __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATIC_DIR = path.join(__dirname, 'dist', 'public');

// Criar diretório estático se não existir
if (!fs.existsSync(STATIC_DIR)) {
  console.log(`Diretório ${STATIC_DIR} não existe. Criando...`);
  fs.mkdirSync(STATIC_DIR, { recursive: true });
}

// Criar index.html para teste
const indexPath = path.join(STATIC_DIR, 'index.html');
if (!fs.existsSync(indexPath)) {
  const indexContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Areia do Pacífico - Servidor Simplificado</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f0f8ff;
            color: #333;
        }
        header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
        }
        h1 {
            color: #0066cc;
        }
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .section {
            margin-bottom: 20px;
        }
        .admin-login {
            margin-top: 30px;
            padding: 15px;
            background-color: #e6f7ff;
            border-radius: 8px;
        }
        form {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 300px;
            margin: 0 auto;
        }
        input {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            padding: 10px;
            background-color: #0066cc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #0055aa;
        }
        #loginResult {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
        }
        .success {
            background-color: #dff0d8;
            color: #3c763d;
        }
        .error {
            background-color: #f2dede;
            color: #a94442;
        }
    </style>
</head>
<body>
    <header>
        <h1>Areia do Pacífico</h1>
        <p>Servidor Simplificado de Testes</p>
    </header>
    
    <div class="container">
        <div class="section">
            <h2>Sobre o Servidor</h2>
            <p>Este é um servidor simplificado para testes da loja Areia do Pacífico. Atualmente, apenas o login administrativo está disponível para testes.</p>
        </div>
        
        <div class="admin-login">
            <h2>Login Administrativo</h2>
            <p>Use as credenciais de administrador para acessar o painel:</p>
            
            <form id="adminLoginForm">
                <input type="text" id="username" placeholder="Nome de usuário" required>
                <input type="password" id="password" placeholder="Senha" required>
                <button type="submit">Entrar</button>
            </form>
            
            <div id="loginResult"></div>
        </div>
    </div>
    
    <script>
        document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const resultDiv = document.getElementById('loginResult');
            
            resultDiv.className = '';
            resultDiv.textContent = 'Autenticando...';
            
            try {
                const response = await fetch('/api/auth/admin-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.className = 'success';
                    resultDiv.textContent = \`Login bem-sucedido! Bem-vindo, \${data.name || data.username}\`;
                    
                    // Armazenar dados do usuário para uso posterior
                    localStorage.setItem('user', JSON.stringify(data));
                    
                    // Redirecionar após 2 segundos
                    setTimeout(() => {
                        window.location.href = '/admin';
                    }, 2000);
                } else {
                    resultDiv.className = 'error';
                    resultDiv.textContent = data.message || 'Falha na autenticação';
                }
            } catch (error) {
                resultDiv.className = 'error';
                resultDiv.textContent = \`Erro: \${error.message}\`;
            }
        });
    </script>
</body>
</html>`;
  
  fs.writeFileSync(indexPath, indexContent);
  console.log(`Arquivo ${indexPath} criado com sucesso!`);
}

// Criar página admin
const adminDir = path.join(STATIC_DIR, 'admin');
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
  
  const adminContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo - Areia do Pacífico</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
        }
        h1 {
            color: #0066cc;
            margin: 0;
        }
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            padding: 20px;
            transition: transform 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        .card h3 {
            margin-top: 0;
            color: #0066cc;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .user-avatar {
            width: 40px;
            height: 40px;
            background-color: #0066cc;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .logout-btn {
            padding: 8px 16px;
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .logout-btn:hover {
            background-color: #d32f2f;
        }
        #sessionInfo {
            margin-top: 15px;
            padding: 10px;
            background-color: #e6f7ff;
            border-radius: 4px;
        }
        #notAuthorized {
            display: none;
            margin-top: 20px;
            padding: 20px;
            background-color: #f2dede;
            color: #a94442;
            border-radius: 8px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="adminPanel">
        <header>
            <h1>Painel Administrativo</h1>
            <div class="user-info">
                <div class="user-avatar" id="userInitials">A</div>
                <div>
                    <strong id="userName">Administrador</strong>
                    <button class="logout-btn" id="logoutBtn">Sair</button>
                </div>
            </div>
        </header>
        
        <div class="container">
            <h2>Dashboard</h2>
            <div id="sessionInfo">
                Verificando sessão...
            </div>
            
            <div class="dashboard">
                <div class="card">
                    <h3>Produtos</h3>
                    <p>Gerencie o catálogo de produtos da loja.</p>
                </div>
                <div class="card">
                    <h3>Categorias</h3>
                    <p>Organize as categorias de produtos.</p>
                </div>
                <div class="card">
                    <h3>Pedidos</h3>
                    <p>Acompanhe e gerencie os pedidos dos clientes.</p>
                </div>
                <div class="card">
                    <h3>Clientes</h3>
                    <p>Visualize informações sobre os clientes da loja.</p>
                </div>
                <div class="card">
                    <h3>Configurações</h3>
                    <p>Ajuste as configurações gerais da loja.</p>
                </div>
                <div class="card">
                    <h3>Relatórios</h3>
                    <p>Gere e analise relatórios de vendas e desempenho.</p>
                </div>
            </div>
        </div>
    </div>
    
    <div id="notAuthorized">
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta área. Por favor, faça login com uma conta administrativa.</p>
        <button id="redirectLoginBtn">Ir para Login</button>
    </div>
    
    <script>
        // Verificar autenticação ao carregar a página
        document.addEventListener('DOMContentLoaded', async () => {
            const adminPanel = document.getElementById('adminPanel');
            const notAuthorized = document.getElementById('notAuthorized');
            const sessionInfo = document.getElementById('sessionInfo');
            const userInitials = document.getElementById('userInitials');
            const userName = document.getElementById('userName');
            
            try {
                // Verificar sessão admin
                const response = await fetch('/api/auth/check-admin-session', {
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (response.ok && data.authorized) {
                    // Usuário autenticado como admin
                    adminPanel.style.display = 'block';
                    notAuthorized.style.display = 'none';
                    
                    // Exibir informações do usuário
                    const user = data.user;
                    userName.textContent = user.name || user.username;
                    
                    if (user.name) {
                        const initials = user.name.split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .substring(0, 2);
                        userInitials.textContent = initials;
                    } else {
                        userInitials.textContent = user.username.substring(0, 2).toUpperCase();
                    }
                    
                    sessionInfo.textContent = \`Sessão ativa: \${user.username} (\${user.role})\`;
                } else {
                    // Usuário não autenticado como admin
                    adminPanel.style.display = 'none';
                    notAuthorized.style.display = 'block';
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
                sessionInfo.textContent = \`Erro ao verificar sessão: \${error.message}\`;
                
                // Mostrar mensagem de erro
                adminPanel.style.display = 'none';
                notAuthorized.style.display = 'block';
            }
        });
        
        // Botão de logout
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
                
                // Limpar dados locais
                localStorage.removeItem('user');
                
                // Redirecionar para a página principal
                window.location.href = '/';
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
            }
        });
        
        // Botão para redirecionar para login
        document.getElementById('redirectLoginBtn').addEventListener('click', () => {
            window.location.href = '/';
        });
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(adminDir, 'index.html'), adminContent);
  console.log(`Página de admin criada em ${adminDir}`);
}

// Criar pasta de imagens
const imgDir = path.join(STATIC_DIR, 'img');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
  
  // Criar SVG placeholder
  const placeholderContent = `<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#E5E7EB"/>
  <path d="M150 125C137.574 125 125.403 127.586 114.074 132.602C102.745 137.618 92.5085 144.957 84.0051 154.14C75.5017 163.323 68.9444 174.133 64.7537 185.92C60.5631 197.708 58.8257 210.236 59.6349 222.707C60.4441 235.179 63.7812 247.337 69.4121 258.392C75.043 269.447 82.8499 279.182 92.3452 287.004C101.841 294.826 112.828 300.6 124.641 303.991C136.455 307.382 148.865 308.32 161.102 306.747" stroke="#9CA3AF" stroke-width="12" stroke-linecap="round"/>
  <path d="M159 125C170.925 125 182.608 127.832 193.323 133.302C204.039 138.771 213.533 146.736 221.237 156.707C228.942 166.678 234.677 178.414 238.036 191.041C241.395 203.668 242.302 216.935 240.703 230C239.104 243.065 235.036 255.626 228.76 266.956C222.485 278.287 214.128 288.109 204.18 295.823C194.233 303.537 182.911 308.953 170.86 311.735C158.809 314.517 146.27 314.596 134.184 311.967" stroke="#9CA3AF" stroke-width="12" stroke-linecap="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M192.372 171.544C192.372 180.562 184.859 187.881 175.592 187.881C166.324 187.881 158.811 180.562 158.811 171.544C158.811 162.526 166.324 155.207 175.592 155.207C184.859 155.207 192.372 162.526 192.372 171.544Z" fill="#9CA3AF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M141.189 171.544C141.189 180.562 133.676 187.881 124.408 187.881C115.141 187.881 107.628 180.562 107.628 171.544C107.628 162.526 115.141 155.207 124.408 155.207C133.676 155.207 141.189 162.526 141.189 171.544Z" fill="#9CA3AF"/>
  <path d="M150 230V230C160.163 211.088 139.837 211.088 150 230V230Z" fill="#9CA3AF"/>
</svg>`;
  fs.writeFileSync(path.join(imgDir, 'placeholder-product.svg'), placeholderContent);
  console.log(`Arquivo placeholder criado em ${imgDir}`);
  
  // Copiar placeholder do attached_assets se existir
  const attachedPlaceholder = path.join(__dirname, 'attached_assets', 'placeholder-product.svg');
  if (fs.existsSync(attachedPlaceholder)) {
    fs.copyFileSync(attachedPlaceholder, path.join(imgDir, 'placeholder-product.svg'));
    console.log(`Arquivo placeholder copiado de ${attachedPlaceholder}`);
  }
}

// Usuários mockados para autenticação
const mockUsers = [
  {
    id: 1,
    username: "Renan1",
    password: "$2b$10$XJvXMZSH6sC7KDm.tusvOed4JK8yHQkGkh.yCOxrUVCfZkbKHJpui", // Familia@1 (hashed)
    email: "renan@teste.com",
    name: "Renan Teste",
    role: "admin"
  }
];

// Armazenamento de sessões
const sessions = {};

// Tipos MIME para servir diferentes tipos de arquivos
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Função para criar o servidor HTTP
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Tratar requisições OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  
  // Verificar se é uma requisição à API
  if (req.url.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }
  
  // Servir arquivos estáticos
  let filePath = path.join(STATIC_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Verificar se o arquivo existe
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Se não for um arquivo, tente redirecionar para index.html
      if (req.url.startsWith('/admin')) {
        filePath = path.join(STATIC_DIR, 'admin', 'index.html');
      } else {
        filePath = path.join(STATIC_DIR, 'index.html');
      }
    }
    
    // Servir o arquivo
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      
      // Determinar o tipo MIME pelo extension
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// Função para gerenciar requisições API
function handleApiRequest(req, res) {
  // Definir cabeçalhos CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // GET /api/auth/me - Verificar usuário atual
  if (req.method === 'GET' && req.url === '/api/auth/me') {
    const sessionId = getSessionId(req);
    
    if (sessionId && sessions[sessionId]) {
      res.writeHead(200, headers);
      res.end(JSON.stringify(sessions[sessionId].user));
    } else {
      res.writeHead(401, headers);
      res.end(JSON.stringify({ message: "Não autenticado" }));
    }
    return;
  }
  
  // GET /api/auth/check-admin-session - Verificar sessão admin
  if (req.method === 'GET' && req.url === '/api/auth/check-admin-session') {
    const sessionId = getSessionId(req);
    
    if (sessionId && sessions[sessionId]) {
      const session = sessions[sessionId];
      
      if (session.user.role === 'admin' && session.adminLogin) {
        res.writeHead(200, headers);
        res.end(JSON.stringify({
          authorized: true,
          user: session.user
        }));
      } else {
        res.writeHead(401, headers);
        res.end(JSON.stringify({
          authorized: false,
          message: "Acesso administrativo não autorizado"
        }));
      }
    } else {
      res.writeHead(401, headers);
      res.end(JSON.stringify({
        authorized: false,
        message: "Acesso administrativo não autorizado"
      }));
    }
    return;
  }
  
  // POST /api/auth/admin-login - Login admin
  if (req.method === 'POST' && req.url === '/api/auth/admin-login') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { username, password } = data;
        
        console.log(`Tentativa de login: ${username}`);
        
        // Encontrar usuário
        const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        // Verificar credenciais - simplificado para comparação direta
        if ((user && user.username.toLowerCase() === "renan1" && password === "Familia@1") || 
            (user && password === user.password)) {
          // Criar sessão
          const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;
          
          sessions[sessionId] = {
            user: userWithoutPassword,
            adminLogin: true,
            loginTime: new Date().toISOString()
          };
          
          // Definir cookie de sessão
          headers['Set-Cookie'] = `sessionId=${sessionId}; Path=/; HttpOnly`;
          
          res.writeHead(200, headers);
          res.end(JSON.stringify({
            ...userWithoutPassword,
            success: true
          }));
        } else {
          res.writeHead(401, headers);
          res.end(JSON.stringify({ message: "Credenciais administrativas inválidas" }));
        }
      } catch (error) {
        console.error('Erro ao processar login:', error);
        res.writeHead(400, headers);
        res.end(JSON.stringify({ message: "Bad Request" }));
      }
    });
    return;
  }
  
  // POST /api/auth/logout - Logout
  if (req.method === 'POST' && req.url === '/api/auth/logout') {
    const sessionId = getSessionId(req);
    
    if (sessionId && sessions[sessionId]) {
      delete sessions[sessionId];
    }
    
    res.writeHead(200, headers);
    res.end(JSON.stringify({ message: "Logout realizado com sucesso" }));
    return;
  }
  
  // API endpoint não encontrado
  res.writeHead(404, headers);
  res.end(JSON.stringify({ message: "API endpoint not found" }));
}

// Função para obter o ID da sessão dos cookies
function getSessionId(req) {
  const cookies = req.headers.cookie;
  
  if (!cookies) {
    return null;
  }
  
  const cookiePairs = cookies.split(';');
  for (const pair of cookiePairs) {
    const [name, value] = pair.trim().split('=');
    if (name === 'sessionId') {
      return value;
    }
  }
  
  return null;
}

// Iniciar o servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});

// Exportar o servidor para uso em outros módulos
export default server;