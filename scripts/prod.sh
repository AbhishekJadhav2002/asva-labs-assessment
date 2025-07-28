#!/bin/bash
set -e

echo "🚀 Starting Production Deployment..."

# check if command exists
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
    export $(grep -v '^#' .env | xargs)
    echo "✅ .env file loaded."
else
    echo ".env file not found."
    exit 1
fi

# Set NODE_ENV to production explicitly
echo "🌍 Setting NODE_ENV to production..."
export NODE_ENV=production

# Stop existing containers
# echo "🛑 Stopping existing containers..."
# docker compose -f docker-compose.yml down
# docker compose -f docker-compose.yml down 2>/dev/null || true

# Remove stale networks safely
echo "🧹 Cleaning Docker networks..."
docker network prune -f

echo "🔧 Docker Credential configurations..."
export DOCKER_CONFIG="${PWD}/docker-config"
rm -rf "$DOCKER_CONFIG" && mkdir -p "$DOCKER_CONFIG"
echo '{"auths":{}}' > "$DOCKER_CONFIG/config.json"

# Build production images
echo "🔨 Building production images..."
# docker compose -f docker-compose.yml build --no-cache
docker compose -f docker-compose.yml build

# Start infrastructure services
echo "🚀 Starting infrastructure services..."
docker compose -f docker-compose.yml up -d postgres redis kafka

# Wait for services to be ready
echo "⏳ Waiting for infrastructure services..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker compose -f docker-compose.yml run --rm api npm run prisma:migrate:deploy

# Start application services
echo "🚀 Starting application services..."
docker compose -f docker-compose.yml up -d api web --force-recreate

# Start Nginx (production only)
echo "🌐 Starting Nginx reverse proxy..."
docker compose -f docker-compose.yml --profile production up -d nginx --force-recreate

# Health check
echo "🔍 Performing health checks..."
sleep 10

# Check if services are running
if docker compose -f docker-compose.yml ps | grep -q "Up"; then
    echo "✅ Production deployment successful!"
    echo ""
    echo "🌐 Application: http://localhost"
    echo "🔌 API: http://localhost/api"
    echo ""
    echo "📊 Monitor logs with: docker compose -f docker-compose.yml logs -f -t"
    echo "🛑 Stop with: docker compose -f docker-compose.yml down"
else
    echo "❌ Some services failed to start. Check logs:"
    docker compose -f docker-compose.yml logs -t
    exit 1
fi