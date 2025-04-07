#!/bin/bash

echo "Try to find Node.js in system..."
which node || echo "Node.js not found in PATH"

echo "Check for database details from check_database_status tool..."
echo "Creating a temporary DATABASE_URL for testing..."
export DATABASE_URL="postgresql://user:password@localhost:5432/my_database"
echo "Using temporary DATABASE_URL: $DATABASE_URL"

echo "Starting server with simple node..."
node -e "console.log('Hello from Node.js'); console.log('Environment DATABASE_URL:', process.env.DATABASE_URL);"