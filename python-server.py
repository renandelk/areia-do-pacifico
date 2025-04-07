import http.server
import socketserver
import os
import mimetypes
import json

PORT = 5000
DIRECTORY = "public"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        print(f"[SERVER] {format % args}")

    def do_GET(self):
        print(f"Request received: GET {self.path}")
        try:
            # Caminho normalizado para o arquivo solicitado
            file_path = self.path
            if file_path == '/':
                file_path = '/index.html'

            # Caminho completo
            full_path = os.path.join(DIRECTORY, file_path.lstrip('/'))
            print(f"Trying to serve: {full_path}")

            # Verificar se o arquivo existe
            if os.path.exists(full_path) and os.path.isfile(full_path):
                # Determinar o tipo MIME
                content_type, _ = mimetypes.guess_type(full_path)
                if content_type is None:
                    content_type = 'application/octet-stream'

                # Servir o arquivo
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.end_headers()
                with open(full_path, 'rb') as file:
                    self.wfile.write(file.read())
            else:
                # Se o caminho começar com /api, retornar erro de API
                if file_path.startswith('/api'):
                    self.send_response(404)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'API endpoint not found'}).encode())
                else:
                    # Para outras solicitações, servir index.html (para SPA)
                    index_path = os.path.join(DIRECTORY, 'index.html')
                    if os.path.exists(index_path):
                        self.send_response(200)
                        self.send_header('Content-type', 'text/html')
                        self.end_headers()
                        with open(index_path, 'rb') as file:
                            self.wfile.write(file.read())
                    else:
                        self.send_error(404, "File not found")
        except Exception as e:
            print(f"Error serving request: {e}")
            self.send_error(500, f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    # Garantir que o diretório existe
    if not os.path.isdir(DIRECTORY):
        print(f"Warning: Directory '{DIRECTORY}' does not exist. Creating it.")
        os.makedirs(DIRECTORY, exist_ok=True)
    
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHandler) as httpd:
        print(f"Serving at http://0.0.0.0:{PORT}/")
        print(f"Serving from directory: {os.path.abspath(DIRECTORY)}")
        
        # Listar arquivos no diretório
        print("\nFiles in directory:")
        for root, dirs, files in os.walk(DIRECTORY):
            level = root.replace(DIRECTORY, '').count(os.sep)
            indent = ' ' * 4 * level
            print(f"{indent}{os.path.basename(root)}/")
            sub_indent = ' ' * 4 * (level + 1)
            for file in files:
                print(f"{sub_indent}{file}")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped by user.")