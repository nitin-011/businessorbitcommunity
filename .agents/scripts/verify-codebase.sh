#!/bin/bash
# Description: Verifies the integrity of the full stack (types, linting)
# Agents should run this after making code changes to ensure they haven't broken the build.

set -e # Exit immediately if a command exits with a non-zero status

# Get the absolute path to the root of the project
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "==========================================="
echo "🔍 Verifying Backend TypeScript..."
echo "==========================================="
cd "$PROJECT_ROOT/backend"
npx tsc --noEmit

echo ""
echo "==========================================="
echo "🔍 Verifying Frontend Linting & Types..."
echo "==========================================="
cd "$PROJECT_ROOT/frontend"
npx next lint
npx tsc --noEmit

echo ""
echo "✅ All checks passed successfully! Codebase is healthy."
