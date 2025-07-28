#!/bin/bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "🧪 Running Tests..."

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

# Function to run tests for a specific workspace
run_tests() {
    local workspace=$1
    echo "Running tests for $workspace..."

    if [ -d "$workspace" ]; then
        cd "${ROOT}/$workspace"
        npm test
        cd - > /dev/null
    else
        echo "⚠️  Workspace $workspace not found, skipping..."
    fi
}

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run type checking
echo "🔍 Type checking..."
npm run type-check

# Run linting
echo "🔧 Linting..."
npm run lint

# Run tests for each workspace
run_tests "apps/api"
run_tests "apps/web"

echo "✅ All tests completed!"