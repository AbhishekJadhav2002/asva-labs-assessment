#!/bin/bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "🏗️  Building Project..."

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
if ! command_exists docker; then
    echo "❌ Docker is required but not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker compose; then
    echo "❌ Docker Compose is required but not installed. Please install Docker Compose first."
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

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p apps/api/logs
mkdir -p apps/web/.next

# Start infrastructure services
echo "🚀 Starting infrastructure services..."
docker compose up -d postgres redis kafka

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are healthy
echo "🔍 Checking service health..."
docker compose ps

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd "$ROOT/apps/api" && npm run prisma:generate && cd ../..

# Run database migrations
echo "🗄️  Running database migrations..."
cd "$ROOT/apps/api" && npm run prisma:migrate:deploy && cd ../..

# Build applications
echo "🔨 Building applications..."
npm run build --workspace=apps/api
npm run build --workspace=apps/web

# Build Docker images
echo "🐳 Building Docker images..."
docker compose build

echo "✅ Build completed successfully!"
echo "🎯 You can now run 'npm run dev' to start the development environment"
echo "🎯 Or run 'npm run prod' to start the production environment"
