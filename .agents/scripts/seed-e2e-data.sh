#!/bin/bash
# Description: Wrapper to run the seed-e2e-data script from within the backend environment

# Get the absolute path to the root of the project
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$PROJECT_ROOT/backend"
npx ts-node scripts/agents/seed-e2e-data.ts
