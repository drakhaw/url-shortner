#!/bin/bash

# Quick Frontend Rebuild Script
# This script rebuilds the frontend container with all new features

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Rebuilding Frontend Container with New Features${NC}"
echo "================================================="

# Check if docker compose is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Current container status:${NC}"
sudo docker compose ps frontend

echo
echo -e "${BLUE}🛑 Stopping frontend container...${NC}"
sudo docker compose stop frontend

echo -e "${BLUE}🗑️  Removing old frontend image...${NC}"
sudo docker image rm url-shortener-frontend 2>/dev/null || echo "Image not found, proceeding..."

echo -e "${BLUE}🔨 Building new frontend image with all features...${NC}"
echo "   - Google OAuth login"
echo "   - Dark theme system"
echo "   - User management interface"
echo "   - Updated routing"
echo

# Build with no cache to ensure we get all new code
sudo docker compose build frontend --no-cache --pull

echo -e "${BLUE}🚀 Starting updated frontend container...${NC}"
sudo docker compose up frontend -d

echo -e "${BLUE}⏳ Waiting for container to be healthy...${NC}"
sleep 10

echo -e "${YELLOW}📊 Final status:${NC}"
sudo docker compose ps frontend

# Check if container is healthy
if sudo docker compose ps frontend | grep -q "healthy"; then
    echo -e "${GREEN}✅ Frontend rebuild completed successfully!${NC}"
    echo
    echo "🌟 New features now available:"
    echo "   • Google OAuth login at http://localhost:3000/login"
    echo "   • Dark theme toggle in navigation"
    echo "   • User management at http://localhost:3000/users"
    echo
    echo "🔧 Next steps:"
    echo "   1. Configure Google OAuth: ./setup-oauth.sh"
    echo "   2. Test the application: http://localhost:3000"
    echo "   3. Login as admin: admin@example.com / admin123"
elif sudo docker compose ps frontend | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Frontend is running but health check pending...${NC}"
    echo "Wait a moment and check: sudo docker compose ps frontend"
else
    echo -e "${RED}❌ Frontend rebuild failed!${NC}"
    echo
    echo "Debug steps:"
    echo "1. Check logs: sudo docker compose logs frontend"
    echo "2. Check build: sudo docker compose build frontend --no-cache"
    echo "3. Check ports: netstat -tulpn | grep :3000"
    exit 1
fi