#!/bin/bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "🚀 Starting Development Environment..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
if ! command_exists docker; then
    echo "❌ Docker is required but not installed."
    exit 1
fi

if ! command_exists docker compose; then
    echo "❌ Docker Compose is required but not installed."
    exit 1
fi

# Check if .env file exists before sourcing
echo "🔍 Checking for .env file..."
if [ -f .env ]; then
    source ${ROOT}/scripts/read_env.sh
    read_env
    echo "✅ .env file loaded."
else
    echo ".env file not found."
    exit 1
fi

# Set NODE_ENV to development explicitly
echo "🌍 Setting NODE_ENV to development..."
export NODE_ENV=development

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose down

# Start services
echo "🚀 Starting services..."
docker compose up -d postgres redis kafka

# Wait for services to be ready
echo "⏳ Waiting for services..."
sleep 20

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd "$ROOT/apps/api" && npm run prisma:generate && cd ../..

# Run database migrations
echo "🗄️  Running database migrations..."
cd "$ROOT/apps/api" && npm run prisma:migrate:dev && cd ../..

# Seed database with demo data
echo "🌱 Seeding database..."
cd "$ROOT/apps/api" && npm run prisma:seed && cd ../..

# Start development servers
echo "🔥 Starting development servers..."

# Start API server in background
echo "Starting API & Web servers..."
npm run all:dev & PID=$!

echo "✅ Development environment started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:3001"
echo "🗄️  Database: postgresql://admin:admin123@localhost:5432/project_management"
echo "🔴 Redis: redis://localhost:6379"
echo "📨 Kafka: localhost:9092"
echo ""
echo "Demo Credentials:"
echo "👤 Admin: admin@demo.com / demo123 / tenant: demo"
echo "👤 User: user@demo.com / demo123 / tenant: demo"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development environment..."
    kill $PID 2>/dev/null || true
    docker compose down
    echo "✅ Development environment stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for background processes
wait