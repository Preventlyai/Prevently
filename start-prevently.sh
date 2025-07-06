#!/bin/bash

# 🚀 Prevently AI - Development Startup Script
# This script starts both the backend API and frontend React app

echo "🏥 Starting Prevently AI Development Environment..."
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null; then
        return 0
    else
        return 1
    fi
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

if ! command_exists mongod && ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not running. Please start MongoDB or use a cloud instance.${NC}"
    echo -e "${BLUE}   You can start MongoDB with: mongod${NC}"
    echo -e "${BLUE}   Or update MONGO_URI in server/.env to use MongoDB Atlas${NC}"
fi

echo -e "${GREEN}✅ Prerequisites check completed${NC}"

# Check if dependencies are installed
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd server && npm install && cd ..
fi

echo -e "${GREEN}✅ Dependencies check completed${NC}"

# Check environment files
echo -e "${BLUE}🔧 Checking environment configuration...${NC}"

if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚙️  Creating backend environment file...${NC}"
    cp server/.env.example server/.env
    echo -e "${BLUE}   📝 Please edit server/.env with your configuration${NC}"
fi

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚙️  Creating frontend environment file...${NC}"
    echo "REACT_APP_API_URL=http://localhost:5001/api" > .env.local
fi

echo -e "${GREEN}✅ Environment configuration completed${NC}"

# Check if ports are available
echo -e "${BLUE}🌐 Checking ports...${NC}"

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use (Frontend). The app may start on a different port.${NC}"
fi

if check_port 5001; then
    echo -e "${RED}❌ Port 5001 is already in use (Backend). Please stop the service using this port.${NC}"
    echo -e "${BLUE}   You can find the process with: lsof -i :5001${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Port check completed${NC}"

# Start services
echo -e "${BLUE}🚀 Starting Prevently AI services...${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down Prevently AI...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ All services stopped. Goodbye!${NC}"
    exit 0
}

# Set trap for cleanup on exit
trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${BLUE}🔧 Starting Backend API Server...${NC}"
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend development server
echo -e "${BLUE}🎨 Starting Frontend React App...${NC}"
npm start &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Display status
echo ""
echo "🎉 Prevently AI is now running!"
echo "================================"
echo -e "${GREEN}🌐 Frontend (React):  http://localhost:3000${NC}"
echo -e "${GREEN}🔧 Backend API:       http://localhost:5001${NC}"
echo -e "${GREEN}📚 API Documentation: http://localhost:5001/api${NC}"
echo -e "${GREEN}💚 Health Check:      http://localhost:5001/health${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "${BLUE}   • Ctrl+C to stop all services${NC}"
echo -e "${BLUE}   • Check logs in terminal windows${NC}"
echo -e "${BLUE}   • Visit http://localhost:3000 to start using the app${NC}"
echo ""
echo -e "${YELLOW}⏳ Starting services... Please wait a moment for everything to load.${NC}"

# Keep script running and wait for user to stop
wait $BACKEND_PID $FRONTEND_PID