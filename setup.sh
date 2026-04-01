#!/bin/bash

echo "Setting up Predictus project..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.example .env
  echo "✓ .env file created. Please update it with your credentials."
fi

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build backend
echo "Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create PostgreSQL database: psql -U postgres -c \"CREATE DATABASE predictus_db;\""
echo "2. Update .env with your database credentials"
echo "3. Run 'npm run dev' to start both servers"
