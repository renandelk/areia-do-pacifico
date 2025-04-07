#!/bin/bash
echo "Iniciando servidor HTTP simples..."

# Caminho para o Node.js
NODE_PATH="/mnt/nixmodules/nix/store/hdq16s6vq9smhmcyl4ipmwfp9f2558rc-nodejs-20.10.0/bin/node"

# Verificar se o Node.js está instalado
if [ ! -f "$NODE_PATH" ]; then
  echo "Node.js não encontrado no caminho esperado"
  echo "Tentando usar o comando 'node' global..."
  NODE_PATH="node"
fi

# Iniciar o servidor
$NODE_PATH simple-admin-server.js