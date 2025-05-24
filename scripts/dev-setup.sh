#!/bin/bash
# AgentCare Development Setup Script
# This script helps set up and start the AgentCare development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT=3000
OLLAMA_PORT=11434

echo -e "${BLUE}🏥 AgentCare v2.0 Development Setup${NC}"
echo "=================================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Stopping processes on port $port...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || echo "No process to kill on port $port"
    sleep 2
}

# Check and handle port conflicts
if check_port $PORT; then
    echo -e "${YELLOW}⚠️  Port $PORT is already in use${NC}"
    read -p "Kill existing process and continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port $PORT
    else
        echo -e "${RED}❌ Exiting due to port conflict${NC}"
        exit 1
    fi
fi

# Check Node.js version
echo -e "${BLUE}🔍 Checking Node.js version...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version 18+ required. Found: $NODE_VERSION${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check npm
echo -e "${BLUE}🔍 Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm found: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check Ollama installation
echo -e "${BLUE}🤖 Checking Ollama installation...${NC}"
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✅ Ollama found${NC}"
    
    # Check if Ollama is running
    if check_port $OLLAMA_PORT; then
        echo -e "${GREEN}✅ Ollama service is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Ollama service not running. Starting...${NC}"
        ollama serve &
        OLLAMA_PID=$!
        sleep 3
        
        if check_port $OLLAMA_PORT; then
            echo -e "${GREEN}✅ Ollama service started${NC}"
        else
            echo -e "${RED}❌ Failed to start Ollama service${NC}"
        fi
    fi
    
    # Check if qwen2.5:latest model is available
    echo -e "${BLUE}🔍 Checking for qwen2.5:latest model...${NC}"
    if ollama list | grep -q "qwen2.5:latest"; then
        echo -e "${GREEN}✅ qwen2.5:latest model found${NC}"
    else
        echo -e "${YELLOW}⚠️  qwen2.5:latest model not found. Pulling...${NC}"
        echo -e "${BLUE}📥 This may take several minutes...${NC}"
        ollama pull qwen2.5:latest
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ qwen2.5:latest model downloaded${NC}"
        else
            echo -e "${RED}❌ Failed to download qwen2.5:latest model${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Ollama not found${NC}"
    echo -e "${YELLOW}📥 Please install Ollama from: https://ollama.ai/download${NC}"
    echo -e "${YELLOW}💡 AgentCare will work in limited mode without Ollama${NC}"
fi

# Check environment file
if [ ! -f ".env" ]; then
    echo -e "${BLUE}⚙️  Creating environment file...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ Environment file created from template${NC}"
    echo -e "${YELLOW}💡 Edit .env file to customize configuration${NC}"
else
    echo -e "${GREEN}✅ Environment file exists${NC}"
fi

# Start the development server
echo -e "${BLUE}🚀 Starting AgentCare development server...${NC}"
echo "=================================================="
echo -e "${GREEN}🌐 Web Interface: http://localhost:3000${NC}"
echo -e "${GREEN}📚 API Health: http://localhost:3000/health${NC}"
echo -e "${GREEN}📊 Metrics: http://localhost:3000/api/v1/metrics${NC}"
echo "=================================================="
echo -e "${YELLOW}💡 Demo credentials:${NC}"
echo -e "   Email: patient@example.com"
echo -e "   Password: demo123"
echo "=================================================="
echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the server
npm run start:dev 