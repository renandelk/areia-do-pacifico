import http.server
import socketserver
import json
import os
import sys
import urllib.parse
import base64
import random
import string
import shutil

PORT = int(os.environ.get('PORT', 5000))
HOST = '0.0.0.0'
sessions = {}

# Criar diretório de dados se não existir
if not os.path.exists('data'):
    os.makedirs('data')

# Criar alguns dados de exemplo se não existirem
if not os.path.exists('data/categories.json'):
    with open('data/categories.json', 'w') as f:
        json.dump([
            {"id": 1, "name": "Biquinis", "slug": "biquinis", "imageUrl": "/img/categories/biquinis.jpg"},
            {"id": 2, "name": "Saídas de Praia", "slug": "saidas-de-praia", "imageUrl": "/img/categories/saidas.jpg"},
            {"id": 3, "name": "Acessórios", "slug": "acessorios", "imageUrl": "/img/categories/acessorios.jpg"}
        ], f)

if not os.path.exists('data/products.json'):
    with open('data/products.json', 'w') as f:
        json.dump([
            {
                "id": 1, 
                "name": "Biquini Florido", 
                "slug": "biquini-florido",
                "description": "Um belo biquini com estampa florida",
                "price": 89.90,
                "categoryId": 1,
                "imageUrl": "/img/products/biquini-1.jpg",
                "featured": True,
                "inventory": 15
            },
            {
                "id": 2, 
                "name": "Saída de Praia Branca", 
                "slug": "saida-de-praia-branca",
                "description": "Saída de praia em tecido leve e fresco",
                "price": 69.90,
                "categoryId": 2, 
                "imageUrl": "/img/products/saida-1.jpg",
                "featured": True,
                "inventory": 10
            },
            {
                "id": 3, 
                "name": "Chapéu de Praia", 
                "slug": "chapeu-de-praia",
                "description": "Chapéu de palha elegante para proteção solar",
                "price": 49.90,
                "categoryId": 3, 
                "imageUrl": "/img/products/chapeu-1.jpg",
                "featured": False,
                "inventory": 20
            }
        ], f)

if not os.path.exists('data/users.json'):
    with open('data/users.json', 'w') as f:
        # Senha: Familia@1 para o usuário Renan1
        json.dump([
            {
                "id": 1,
                "username": "Renan1",
                "password": "Familia@1",  # Em produção deve ser hash
                "email": "admin@example.com",
                "role": "admin",
                "name": "Renan Admin"
            }
        ], f)

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Tenta usar a pasta 'dist', se não existir, usa a pasta atual
        directory = 'dist' if os.path.exists('dist') else '.'
        super().__init__(*args, directory=directory, **kwargs)

    def log_message(self, format, *args):
        # Mostra os logs para debugging
        print(format % args)

    def do_GET(self):
        print(f"GET request: {self.path}")
        if self.path.startswith('/api/'):
            self.handle_api_get()
        else:
            # Verifica se o caminho é para um arquivo estático
            file_path = self.translate_path(self.path)
            if os.path.exists(file_path) and not os.path.isdir(file_path):
                super().do_GET()
            else:
                # Serve index.html para rotas de frontend
                try:
                    # Primeiramente, tenta servir um arquivo existente
                    super().do_GET()
                except:
                    # Se falhar, serve o index.html
                    self.path = '/index.html'
                    try:
                        super().do_GET()
                    except:
                        # Se ainda falhar, cria uma página HTML básica
                        self.send_response(200)
                        self.send_header("Content-type", "text/html")
                        self.end_headers()
                        html = """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Areia do Pacífico</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 0; padding: 0; 
                                       display: flex; justify-content: center; align-items: center; 
                                       height: 100vh; background-color: #f5f5f5; }
                                .container { text-align: center; padding: 2rem; 
                                             background-color: white; border-radius: 8px;
                                             box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                h1 { color: #ff6b6b; }
                                p { color: #555; margin-bottom: 1.5rem; }
                                a { color: #ff6b6b; text-decoration: none; font-weight: bold; }
                                a:hover { text-decoration: underline; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>Areia do Pacífico</h1>
                                <p>Bem-vindo à nossa loja de moda praia!</p>
                                <p>Nosso site está atualmente em manutenção.</p>
                                <p>Enquanto isso, você pode acessar nossa <a href="/api/products">API de produtos</a></p>
                            </div>
                        </body>
                        </html>
                        """
                        self.wfile.write(html.encode())

    def do_POST(self):
        print(f"POST request: {self.path}")
        if self.path.startswith('/api/'):
            self.handle_api_post()
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def handle_api_get(self):
        # Manuseia rotas de API
        if self.path == '/api/auth/me':
            session_id = self.get_session_id()
            if session_id and session_id in sessions:
                self.send_json_response(200, {"user": sessions[session_id]})
            else:
                self.send_json_response(401, {"error": "Unauthorized"})
                
        elif self.path == '/api/auth/check-admin-session':
            session_id = self.get_session_id()
            if session_id and session_id in sessions and sessions[session_id].get('role') == 'admin':
                self.send_json_response(200, {
                    "valid": True,
                    "user": sessions[session_id]
                })
            else:
                self.send_json_response(401, {"valid": False, "error": "Não autorizado"})
                
        elif self.path == '/api/categories':
            with open('data/categories.json', 'r') as f:
                categories = json.load(f)
            self.send_json_response(200, categories)
            
        elif self.path.startswith('/api/categories/'):
            parts = self.path.split('/')
            if len(parts) > 3:
                try:
                    category_id = int(parts[3])
                    with open('data/categories.json', 'r') as f:
                        categories = json.load(f)
                    category = next((c for c in categories if c['id'] == category_id), None)
                    if category:
                        self.send_json_response(200, category)
                    else:
                        self.send_json_response(404, {"error": "Categoria não encontrada"})
                except ValueError:
                    self.send_json_response(400, {"error": "ID de categoria inválido"})
                    
        elif self.path == '/api/products':
            with open('data/products.json', 'r') as f:
                products = json.load(f)
            self.send_json_response(200, products)
            
        elif self.path.startswith('/api/products/'):
            parts = self.path.split('/')
            if len(parts) > 3:
                if parts[3] == 'featured':
                    with open('data/products.json', 'r') as f:
                        products = json.load(f)
                    featured = [p for p in products if p.get('featured', False)]
                    self.send_json_response(200, featured)
                else:
                    try:
                        product_id = int(parts[3])
                        with open('data/products.json', 'r') as f:
                            products = json.load(f)
                        product = next((p for p in products if p['id'] == product_id), None)
                        if product:
                            self.send_json_response(200, product)
                        else:
                            self.send_json_response(404, {"error": "Produto não encontrado"})
                    except ValueError:
                        self.send_json_response(400, {"error": "ID de produto inválido"})
                        
        elif self.path == '/api/analytics':
            # Verifica se o usuário é admin
            session_id = self.get_session_id()
            if not (session_id and session_id in sessions and sessions[session_id].get('role') == 'admin'):
                self.send_json_response(401, {"error": "Não autorizado"})
                return
                
            # Dados simulados de analytics
            analytics_data = {
                "salesOverTime": {
                    "daily": [
                        {"date": "2025-04-01", "sales": 1250},
                        {"date": "2025-04-02", "sales": 1500},
                        {"date": "2025-04-03", "sales": 1750},
                        {"date": "2025-04-04", "sales": 1600},
                        {"date": "2025-04-05", "sales": 1800}
                    ],
                    "monthly": [
                        {"month": "Jan", "sales": 35000},
                        {"month": "Feb", "sales": 32000},
                        {"month": "Mar", "sales": 40000},
                        {"month": "Apr", "sales": 38000}
                    ]
                },
                "salesByCategory": [
                    {"name": "Biquinis", "sales": 45000},
                    {"name": "Saídas de Praia", "sales": 30000},
                    {"name": "Acessórios", "sales": 25000}
                ],
                "topProducts": [
                    {"name": "Biquini Florido", "sales": 120},
                    {"name": "Saída de Praia Branca", "sales": 95},
                    {"name": "Chapéu de Praia", "sales": 80}
                ],
                "orderStatus": {
                    "pending": 15,
                    "processing": 8,
                    "shipped": 22,
                    "delivered": 45,
                    "cancelled": 5
                },
                "averageOrderValue": 185.5,
                "geographicData": {
                    "Rio de Janeiro": 35,
                    "São Paulo": 28,
                    "Bahia": 15,
                    "Santa Catarina": 12,
                    "Outros": 10
                }
            }
            self.send_json_response(200, analytics_data)
            
        else:
            self.send_json_response(404, {"error": "API route not found"})
    
    def handle_api_post(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                self.send_json_response(400, {"error": "Invalid JSON"})
                return
        else:
            data = {}
        
        if self.path == '/api/auth/login' or self.path == '/api/auth/admin-login':
            username = data.get('username')
            password = data.get('password')
            
            # Verifica credenciais
            with open('data/users.json', 'r') as f:
                users = json.load(f)
            
            user = next((u for u in users if u['username'] == username and u['password'] == password), None)
            
            if user:
                # Cria uma nova sessão
                session_id = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
                user_data = {
                    "id": user['id'],
                    "username": user['username'],
                    "email": user['email'],
                    "role": user['role'],
                    "name": user.get('name')
                }
                sessions[session_id] = user_data
                
                self.send_json_response(200, {
                    "success": True, 
                    "user": user_data,
                    "token": session_id
                }, {"Set-Cookie": f"session={session_id}; Path=/; HttpOnly"})
            else:
                self.send_json_response(401, {
                    "success": False,
                    "error": "Credenciais inválidas"
                })
                
        elif self.path == '/api/auth/logout':
            session_id = self.get_session_id()
            if session_id and session_id in sessions:
                del sessions[session_id]
            self.send_json_response(200, {"success": True})
            
        else:
            self.send_json_response(404, {"error": "API route not found"})
    
    def send_json_response(self, status, data, headers=None):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        if headers:
            for key, value in headers.items():
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def get_session_id(self):
        # Extrai o ID da sessão dos cookies
        cookies = self.headers.get('Cookie')
        if not cookies:
            return None
        
        for cookie in cookies.split(';'):
            if '=' in cookie:
                name, value = cookie.strip().split('=', 1)
                if name == 'session':
                    return value
        
        # Verifica o cabeçalho de autorização
        auth_header = self.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            return auth_header[7:]  # Remove 'Bearer ' prefix
            
        return None

def main():
    try:
        server = http.server.HTTPServer((HOST, PORT), CustomHandler)
        print(f"Servidor iniciado em http://{HOST}:{PORT}")
        print(f"Credenciais de admin: username='Renan1', password='Familia@1'")
        print(f"Acesse http://{HOST}:{PORT}/api/products para ver os produtos")
        server.serve_forever()
    except KeyboardInterrupt:
        print("Servidor parado")
        server.server_close()
        sys.exit(0)

if __name__ == "__main__":
    main()