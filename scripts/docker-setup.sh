#!/bin/bash

set -e

echo "🐳 Predictus Docker Setup"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "Docker daemon is not running. Please start Docker."
    exit 1
fi

echo -e "${BLUE}Step 1: Starting PostgreSQL container...${NC}"
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo -e "${BLUE}Step 2: Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
    if docker exec predictus_postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is ready!${NC}"
        break
    fi
    echo "  Waiting... ($i/30)"
    sleep 1
done

# Start pgAdmin (optional)
echo -e "${BLUE}Step 3: Starting pgAdmin (optional)...${NC}"
docker-compose up -d pgadmin

echo ""
echo -e "${GREEN}Database setup complete!${NC}"
echo ""
echo -e "${YELLOW}Database Information:${NC}"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  User: postgres"
echo "  Password: postgres"
echo "  Database: predictus_db"
echo ""
echo -e "${YELLOW}🔧 Useful Commands:${NC}"
echo "  # Start containers:"
echo "    docker-compose up -d"
echo ""
echo "  # Stop containers:"
echo "    docker-compose down"
echo ""
echo "  # View logs:"
echo "    docker-compose logs -f postgres"
echo ""
echo "  # Connect to database:"
echo "    psql -h localhost -U postgres -d predictus_db"
echo ""
echo "  # pgAdmin Web UI:"
echo "    http://localhost:5050"
echo "    Email: admin@example.com"
echo "    Password: admin"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Start the backend: pnpm dev"
echo "  2. The backend will auto-sync the database schema"
echo ""
