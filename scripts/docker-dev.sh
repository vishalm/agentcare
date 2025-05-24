#!/bin/bash
# AgentCare Docker Development Script
# This script helps run AgentCare using Docker Compose

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 AgentCare v2.0 Docker Development${NC}"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker Desktop${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker found${NC}"

# Use docker compose if available, fallback to docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✅ Using: $COMPOSE_CMD${NC}"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}⚙️  Creating environment file...${NC}"
    cp env.example .env
    
    # Update .env for Docker environment
    sed -i '' 's/OLLAMA_BASE_URL=http:\/\/localhost:11434/OLLAMA_BASE_URL=http:\/\/ollama:11434/' .env 2>/dev/null || \
    sed -i 's/OLLAMA_BASE_URL=http:\/\/localhost:11434/OLLAMA_BASE_URL=http:\/\/ollama:11434/' .env
    
    echo -e "${GREEN}✅ Environment file created and configured for Docker${NC}"
else
    echo -e "${GREEN}✅ Environment file exists${NC}"
fi

# Function to stop and clean up
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping AgentCare containers...${NC}"
    $COMPOSE_CMD down
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Ask user what they want to run
echo -e "${BLUE}🚀 Choose deployment mode:${NC}"
echo "1) Development mode (with hot reload)"
echo "2) Production mode (optimized build)"
echo "3) Full stack with monitoring"
echo "4) Stop all containers"

read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}🔨 Starting development mode...${NC}"
        $COMPOSE_CMD --profile development up --build
        ;;
    2)
        echo -e "${BLUE}🏭 Starting production mode...${NC}"
        $COMPOSE_CMD up --build agentcare ollama redis
        ;;
    3)
        echo -e "${BLUE}📊 Starting full stack with monitoring...${NC}"
        $COMPOSE_CMD --profile monitoring up --build
        ;;
    4)
        echo -e "${BLUE}🛑 Stopping all containers...${NC}"
        $COMPOSE_CMD down --volumes
        docker system prune -f
        echo -e "${GREEN}✅ All containers stopped and cleaned up${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac 