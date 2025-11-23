# Justfile for x402 Gateway

set dotenv-load

# List available recipes
default:
    @just --list

# Install dependencies
setup:
    npm install

# Run local development server
dev:
    npm run dev

# Run local development server with live reload (same as dev)
start: dev

# Build the worker (dry-run)
build:
    npm run build

# Deploy to Cloudflare Workers
deploy:
    npm run deploy

# Generate TypeScript types for Cloudflare Workers
types:
    npm run types

# Run tests
test:
    npm run test

# Clean up build artifacts and dependencies
clean:
    rm -rf node_modules dist .wrangler

# Set a secret in Cloudflare (usage: just secret <KEY>)
secret KEY:
    wrangler secret put {{KEY}}

# Set the client wallet private key secret
secret-pk:
    wrangler secret put CLIENT_WALLET_PK

# Set the circular wallet address secret
secret-wallet:
    wrangler secret put CIRCULAR_WALLET_ADDRESS

# Check health of local server
check-health:
    curl http://localhost:8787/health

# Check pricing of local server
check-pricing:
    curl http://localhost:8787/pricing

# Tail logs from the deployed worker
logs:
    wrangler tail
