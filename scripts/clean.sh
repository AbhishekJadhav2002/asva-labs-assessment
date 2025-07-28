#!/bin/bash
set -e

echo "🧹 Cleaning up..."

# Stop and remove all containers
echo "Stopping containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose -f docker compose.yml down --remove-orphans 2>/dev/null || true

# Remove Docker images (optional)
read -p "Remove Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing Docker images..."
    docker compose down --rmi all --volumes --remove-orphans 2>/dev/null || true
    docker compose -f docker compose.yml down --rmi all --volumes --remove-orphans 2>/dev/null || true
fi

# Clean node_modules
read -p "Remove node_modules directories? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing node_modules..."
    rm -rf node_modules
    rm -rf apps/*/node_modules
    rm -rf packages/*/node_modules
fi

# Clean build directories
echo "Removing build directories..."
rm -rf apps/api/build
rm -rf apps/api/logs
rm -rf apps/web/.next
rm -rf apps/web/build

echo "✅ Cleanup completed!"